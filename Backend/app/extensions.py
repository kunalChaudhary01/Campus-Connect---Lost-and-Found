from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from pymongo.errors import PyMongoError

jwt = JWTManager()
mongo_client = None
mongo_db = None


def init_mongo(app):
    global mongo_client, mongo_db
    mongo_client = MongoClient(
        app.config["MONGO_URI"],
        serverSelectionTimeoutMS=3000,
        connectTimeoutMS=3000,
        socketTimeoutMS=3000,
    )
    mongo_db = mongo_client[app.config["MONGO_DATABASE"]]
    try:
        mongo_db.users.create_index("email", unique=True)
        mongo_db.posts.create_index([("status", 1), ("created_at", -1)])
        mongo_db.item_requests.create_index([("post_id", 1), ("requester_id", 1)], unique=True)
    except PyMongoError:
        # MongoDB may be started after the Flask process during local setup.
        pass
