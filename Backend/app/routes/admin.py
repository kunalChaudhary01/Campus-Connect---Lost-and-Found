from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import mongo_db
from ..mongo import oid, user_doc
admin_bp=Blueprint('admin',__name__)

def admin():return mongo_db.users.find_one({'_id':oid(get_jwt_identity()),'role':'ADMIN'})
def denied():return jsonify({'success':False,'message':'Admin access required'}),403

@admin_bp.get('/users')
@jwt_required()
def users():
    if not admin():return denied()
    return jsonify({'success':True,'message':'Users loaded','data':{'users':[user_doc(row) for row in mongo_db.users.find()]}})

@admin_bp.get('/reports')
@jwt_required()
def reports():
    if not admin():return denied()
    rows=[{'id':str(row['_id']),'post_id':str(row['post_id']),'reason':row['reason'],'status':row['status'],'created_at':row['created_at'].isoformat()} for row in mongo_db.reports.find().sort('created_at',-1)]
    return jsonify({'success':True,'message':'Reports loaded','data':{'reports':rows}})

@admin_bp.delete('/posts/<post_id>')
@jwt_required()
def remove_post(post_id):
    if not admin():return denied()
    result=mongo_db.posts.delete_one({'_id':oid(post_id)})
    if not result.deleted_count:return jsonify({'success':False,'message':'Post not found'}),404
    return jsonify({'success':True,'message':'Post removed'})

