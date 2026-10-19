from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import mongo_db
from ..mongo import oid, user_doc
users_bp=Blueprint('users',__name__)

@users_bp.get('/<user_id>')
def get_user(user_id):
    user=mongo_db.users.find_one({'_id':oid(user_id)})
    if not user:return jsonify({'success':False,'message':'User not found'}),404
    return jsonify({'success':True,'message':'User loaded','data':{'user':user_doc(user)}})

@users_bp.put('/<user_id>')
@jwt_required()
def update_user(user_id):
    if str(oid(get_jwt_identity()))!=user_id:
        return jsonify({'success':False,'message':'You can only edit your own profile'}),403
    payload=request.get_json(silent=True) or {}
    values={}
    for key in ['name','college','student_id']:
        val=payload.get(key)
        if val and isinstance(val,str) and val.strip():
            values[key]=val.strip()
    if not values:
        return jsonify({'success':False,'message':'No valid fields to update'}),400
    mongo_db.users.update_one({'_id':oid(user_id)},{'$set':values})
    user=mongo_db.users.find_one({'_id':oid(user_id)})
    return jsonify({'success':True,'message':'Profile updated','data':{'user':user_doc(user)}})

