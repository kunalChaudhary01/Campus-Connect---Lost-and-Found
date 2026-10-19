from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import mongo_db
from ..mongo import oid

chat_bp=Blueprint('chat',__name__)
def out(message,data=None,status=200):
    body={'success':status<400,'message':message};
    if data is not None:body['data']=data
    return jsonify(body),status

def allowed(row,user_id): return row and user_id in {row['requester_id'],row['owner_id']}

def conversation_doc(row):
    request_row=mongo_db.item_requests.find_one({'_id':row['request_id']}); post=mongo_db.posts.find_one({'_id':request_row['post_id']}) if request_row else None
    return {'id':str(row['_id']),'request_id':str(row['request_id']),'post_title':post['title'] if post else '', 'participants':[str(request_row['requester_id']),str(request_row['owner_id'])]}

@chat_bp.get('')
@jwt_required()
def conversations():
    user_id=oid(get_jwt_identity()); rows=[]
    for row in mongo_db.conversations.find():
        req=mongo_db.item_requests.find_one({'_id':row['request_id']})
        if allowed(req,user_id):rows.append(conversation_doc(row))
    return out('Conversations loaded',{'conversations':rows})

@chat_bp.get('/<conversation_id>/messages')
@jwt_required()
def messages(conversation_id):
    row=mongo_db.conversations.find_one({'_id':oid(conversation_id)}); user_id=oid(get_jwt_identity()); req=mongo_db.item_requests.find_one({'_id':row['request_id']}) if row else None
    if not row:return out('Conversation not found',status=404)
    if not allowed(req,user_id):return out('Unauthorized conversation access',status=403)
    result=[]
    for item in mongo_db.messages.find({'conversation_id':row['_id']}).sort('created_at',1):
        sender=mongo_db.users.find_one({'_id':item['sender_id']}); result.append({'id':str(item['_id']),'conversation_id':str(row['_id']),'sender_id':str(item['sender_id']),'sender_name':sender['name'],'message':item['message'],'created_at':item['created_at'].isoformat()})
    return out('Messages loaded',{'messages':result})

@chat_bp.post('/<conversation_id>/messages')
@jwt_required()
def send_message(conversation_id):
    row=mongo_db.conversations.find_one({'_id':oid(conversation_id)}); user_id=oid(get_jwt_identity()); payload=request.get_json(silent=True) or {}; req=mongo_db.item_requests.find_one({'_id':row['request_id']}) if row else None
    if not row:return out('Conversation not found',status=404)
    if not allowed(req,user_id):return out('Unauthorized conversation access',status=403)
    if req['status']!='APPROVED':return out('Chat is available after approval',status=403)
    text=payload.get('message','').strip()
    if not text:return out('Message is required',status=400)
    item={'conversation_id':row['_id'],'sender_id':user_id,'message':text,'created_at':datetime.now(timezone.utc)}; item['_id']=mongo_db.messages.insert_one(item).inserted_id
    other=req['owner_id'] if user_id==req['requester_id'] else req['requester_id']; post=mongo_db.posts.find_one({'_id':req['post_id']}); mongo_db.notifications.insert_one({'user_id':other,'type':'NEW_MESSAGE','message':f"You received a new message about {post['title']}",'is_read':False,'created_at':datetime.now(timezone.utc)})
    sender=mongo_db.users.find_one({'_id':user_id}); return out('Message sent',{'message':{'id':str(item['_id']),'conversation_id':str(row['_id']),'sender_id':str(user_id),'sender_name':sender['name'],'message':text,'created_at':item['created_at'].isoformat()}},201)
