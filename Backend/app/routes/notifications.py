from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import mongo_db
from ..mongo import oid
notifications_bp=Blueprint('notifications',__name__)

def doc(row): return {'id':str(row['_id']),'type':row['type'],'message':row['message'],'is_read':row.get('is_read',False),'created_at':row['created_at'].isoformat()}

@notifications_bp.get('')
@jwt_required()
def list_notifications():
    rows=mongo_db.notifications.find({'user_id':oid(get_jwt_identity())}).sort('created_at',-1)
    return jsonify({'success':True,'message':'Notifications loaded','data':{'notifications':[doc(row) for row in rows]}})

@notifications_bp.put('/<notification_id>/read')
@jwt_required()
def mark_read(notification_id):
    result=mongo_db.notifications.update_one({'_id':oid(notification_id),'user_id':oid(get_jwt_identity())},{'$set':{'is_read':True}})
    if not result.matched_count:return jsonify({'success':False,'message':'Notification not found'}),404
    return jsonify({'success':True,'message':'Notification marked as read'})
