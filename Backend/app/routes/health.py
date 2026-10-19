from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("")
def health_check():
    return jsonify({"success": True, "message": "Campus Connect API is running"})
