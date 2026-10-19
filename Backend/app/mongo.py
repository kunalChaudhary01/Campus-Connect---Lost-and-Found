from bson import ObjectId
from bson.errors import InvalidId
from flask_jwt_extended import get_jwt_identity
from .extensions import mongo_db


def oid(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def current_user():
    return mongo_db.users.find_one({"_id": oid(get_jwt_identity())})


def user_doc(document):
    if not document:
        return None
    return {"id": str(document["_id"]), "name": document["name"], "email": document["email"], "college": document["college"], "student_id": document["student_id"], "role": document.get("role", "USER"), "is_suspended": document.get("is_suspended", False)}


def post_doc(document):
    if not document:
        return None
    owner = mongo_db.users.find_one({"_id": document["user_id"]}) if document.get("user_id") else None
    guest = {"id": None, "name": "Campus member", "email": "", "college": "", "student_id": "", "role": "GUEST", "is_suspended": False}
    return {"id": str(document["_id"]), "user_id": str(document["user_id"]) if document.get("user_id") else None, "type": document["type"], "title": document["title"], "description": document["description"], "category": document["category"], "location": document["location"], "event_date": document["event_date"], "image_url": document.get("image_url"), "additional_info": document.get("additional_info"), "status": document.get("status", "ACTIVE"), "created_at": document["created_at"].isoformat(), "owner": user_doc(owner) or guest}
