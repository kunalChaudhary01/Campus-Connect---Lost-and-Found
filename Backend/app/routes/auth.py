from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash
from pymongo.errors import DuplicateKeyError
from ..extensions import mongo_db
from ..mongo import oid, user_doc
from ..schemas.auth import validate_login, validate_registration

auth_bp = Blueprint("auth", __name__)


def response(message, data=None, status=200):
    body = {"success": status < 400, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    error = validate_registration(payload)
    if error:
        return response(error, status=400)

    email = payload["email"].strip().lower()
    user = {"name": payload["name"].strip(), "email": email, "password_hash": generate_password_hash(payload["password"]), "college": payload["college"].strip(), "student_id": payload["student_id"].strip(), "role": "USER", "is_suspended": False}
    try:
        result = mongo_db.users.insert_one(user)
    except DuplicateKeyError:
        return response("An account with this email already exists", status=409)
    user["_id"] = result.inserted_id
    return response("Account created successfully", {"token": create_access_token(identity=str(result.inserted_id)), "user": user_doc(user)}, 201)


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    error = validate_login(payload)
    if error:
        return response(error, status=400)

    user = mongo_db.users.find_one({"email": payload["email"].strip().lower()})
    if not user or not check_password_hash(user["password_hash"], payload["password"]):
        return response("Invalid email or password", status=401)
    if user.get("is_suspended"):
        return response("This account has been suspended", status=403)

    token = create_access_token(identity=str(user["_id"]))
    return response("Login successful", {"token": token, "user": user_doc(user)})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = mongo_db.users.find_one({"_id": oid(get_jwt_identity())})
    if not user:
        return response("User not found", status=404)
    return response("Profile loaded", {"user": user_doc(user)})


@auth_bp.post("/logout")
@jwt_required()
def logout():
    return response("Logout successful")
