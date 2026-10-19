from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import mongo_db
from ..mongo import oid

requests_bp = Blueprint('requests', __name__)
def out(message, data=None, status=200):
    body={'success': status < 400, 'message': message};
    if data is not None: body['data']=data
    return jsonify(body), status

def request_doc(row):
    post=mongo_db.posts.find_one({'_id':row['post_id']})
    return {'id':str(row['_id']),'post_id':str(row['post_id']),'requester_id':str(row['requester_id']),'owner_id':str(row['owner_id']),'message':row['message'],'status':row['status'],'created_at':row['created_at'].isoformat(),'post_title':post['title'] if post else ''}

@requests_bp.get('')
@jwt_required()
def list_requests():
    user_id=oid(get_jwt_identity()); rows=mongo_db.item_requests.find({'$or':[{'requester_id':user_id},{'owner_id':user_id}]}).sort('created_at',-1)
    return out('Requests loaded',{'requests':[request_doc(row) for row in rows]})

@requests_bp.post('')
@jwt_required()
def create_request():
    user_id=oid(get_jwt_identity()); payload=request.get_json(silent=True) or {}; post=mongo_db.posts.find_one({'_id':oid(payload.get('post_id'))})
    if not post: return out('Post not found',status=404)
    if post.get('status')!='ACTIVE': return out('Only active posts can be requested',status=400)
    if post['user_id']==user_id: return out('You cannot request your own post',status=400)
    if not post.get('user_id'): return out('Cannot contact a guest post owner',status=400)
    if mongo_db.item_requests.find_one({'post_id':post['_id'],'requester_id':user_id}): return out('Request already exists',status=409)
    row={'post_id':post['_id'],'requester_id':user_id,'owner_id':post['user_id'],'message':payload.get('message','').strip(),'status':'PENDING','created_at':datetime.now(timezone.utc)}
    if not row['message']: return out('A message is required',status=400)
    label = 'found item' if post['type']=='FOUND' else 'lost item'
    row['_id']=mongo_db.item_requests.insert_one(row).inserted_id; mongo_db.notifications.insert_one({'user_id':post['user_id'],'type':'REQUEST_RECEIVED','message':f"Someone responded to your {label}: {post['title']}",'is_read':False,'created_at':datetime.now(timezone.utc)})
    return out('Request sent',{'request':request_doc(row)},201)

@requests_bp.put('/<request_id>/<action>')
@jwt_required()
def decide_request(request_id,action):
    row=mongo_db.item_requests.find_one({'_id':oid(request_id)}); user_id=oid(get_jwt_identity())
    if not row:return out('Request not found',status=404)
    if row['owner_id']!=user_id:return out('Only the post owner can decide this request',status=403)
    if action not in {'approve','reject'} or row['status']!='PENDING':return out('Invalid request action',status=400)
    status='APPROVED' if action=='approve' else 'REJECTED'; mongo_db.item_requests.update_one({'_id':row['_id']},{'$set':{'status':status}})
    post=mongo_db.posts.find_one({'_id':row['post_id']}); mongo_db.notifications.insert_one({'user_id':row['requester_id'],'type':'REQUEST_'+status,'message':f"Your request for {post['title']} was {status.lower()}",'is_read':False,'created_at':datetime.now(timezone.utc)})
    if status=='APPROVED': mongo_db.conversations.update_one({'request_id':row['_id']},{'$setOnInsert':{'request_id':row['_id'],'created_at':datetime.now(timezone.utc)}},upsert=True)
    row['status']=status; return out(f'Request {status.lower()}',{'request':request_doc(row)})

