from datetime import date, datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import mongo_db
from ..mongo import oid, post_doc

posts_bp = Blueprint("posts", __name__)

def result(message, data=None, status=200):
    body = {"success": status < 400, "message": message}
    if data is not None: body["data"] = data
    return jsonify(body), status

def validate_payload(payload):
    required = ["type", "title", "description", "category", "location", "event_date"]
    if any(not str(payload.get(field, "")).strip() for field in required): return "Type, title, description, category, location, and date are required"
    if payload["type"].upper() not in {"LOST", "FOUND"}: return "Post type must be LOST or FOUND"
    try: date.fromisoformat(payload["event_date"])
    except ValueError: return "Date must use YYYY-MM-DD format"
    return None

@posts_bp.get("")
def list_posts():
    filters = {"status": request.args.get("status", "ACTIVE").upper()}; post_type = request.args.get("type", "").upper(); search = request.args.get("search", "").strip()
    if post_type in {"LOST", "FOUND"}: filters["type"] = post_type
    for field in ["category", "location"]:
        if request.args.get(field): filters[field] = {"$regex": request.args[field], "$options": "i"}
    if search: filters["$or"] = [{field: {"$regex": search, "$options": "i"}} for field in ["title", "description", "category", "location"]]
    rows = mongo_db.posts.find(filters).sort("created_at", -1)
    return result("Posts loaded", {"posts": [post_doc(row) for row in rows]})

@posts_bp.post("")
@jwt_required(optional=True)
def create_post():
    payload = request.get_json(silent=True) or {}; error = validate_payload(payload)
    if error: return result(error, status=400)
    document = {"user_id": oid(get_jwt_identity()) if get_jwt_identity() else None, "type": payload["type"].upper(), "title": payload["title"].strip(), "description": payload["description"].strip(), "category": payload["category"].strip(), "location": payload["location"].strip(), "event_date": payload["event_date"], "image_url": payload.get("image_url"), "additional_info": payload.get("additional_info"), "status": "ACTIVE", "created_at": datetime.now(timezone.utc)}
    result_id = mongo_db.posts.insert_one(document).inserted_id; document["_id"] = result_id
    return result("Post created successfully", {"post": post_doc(document)}, 201)

@posts_bp.get("/<post_id>")
def get_post(post_id):
    post = mongo_db.posts.find_one({"_id": oid(post_id)})
    return result("Post not found", status=404) if not post else result("Post loaded", {"post": post_doc(post)})

@posts_bp.put("/<post_id>")
@jwt_required()
def update_post(post_id):
    post = mongo_db.posts.find_one({"_id": oid(post_id)})
    if not post: return result("Post not found", status=404)
    if post["user_id"] != oid(get_jwt_identity()): return result("You can only edit your own posts", status=403)
    payload = request.get_json(silent=True) or {}; error = validate_payload({**post, **payload, "event_date": payload.get("event_date", post["event_date"])})
    if error: return result(error, status=400)
    allowed = {key: payload[key] for key in ["type", "title", "description", "category", "location", "event_date", "image_url", "additional_info", "status"] if key in payload}
    if "type" in allowed: allowed["type"] = allowed["type"].upper()
    mongo_db.posts.update_one({"_id": post["_id"]}, {"$set": allowed})
    return result("Post updated successfully", {"post": post_doc(mongo_db.posts.find_one({"_id": post["_id"]}))})

@posts_bp.delete("/<post_id>")
@jwt_required()
def delete_post(post_id):
    post = mongo_db.posts.find_one({"_id": oid(post_id)})
    if not post: return result("Post not found", status=404)
    if post["user_id"] != oid(get_jwt_identity()): return result("You can only delete your own posts", status=403)
    mongo_db.posts.delete_one({"_id": post["_id"]}); return result("Post deleted successfully")

@posts_bp.put("/<post_id>/resolve")
@jwt_required()
def resolve_post(post_id):
    post = mongo_db.posts.find_one({"_id": oid(post_id)})
    if not post: return result("Post not found", status=404)
    if post["user_id"] != oid(get_jwt_identity()): return result("Only the post owner can resolve it", status=403)
    mongo_db.posts.update_one({"_id": post["_id"]}, {"$set": {"status": "RESOLVED"}})
    return result("Post marked as resolved", {"post": post_doc(mongo_db.posts.find_one({"_id": post["_id"]}))})

@posts_bp.post("/<post_id>/report")
@jwt_required()
def report_post(post_id):
    post = mongo_db.posts.find_one({"_id": oid(post_id)})
    if not post: return result("Post not found", status=404)
    payload = request.get_json(silent=True) or {}
    reason = payload.get("reason", "").strip()
    if not reason: return result("A reason is required", status=400)
    row = {"post_id": post["_id"], "reported_by": oid(get_jwt_identity()), "reason": reason, "status": "OPEN", "created_at": datetime.now(timezone.utc)}
    insert_result = mongo_db.reports.insert_one(row)
    return result("Report submitted", {"id": str(insert_result.inserted_id)}, 201)

