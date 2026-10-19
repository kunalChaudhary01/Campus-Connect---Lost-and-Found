from flask import Flask
from flask_cors import CORS
from pymongo.errors import PyMongoError

from .config import Config
from .extensions import init_mongo, jwt


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    init_mongo(app)
    jwt.init_app(app)

    @app.errorhandler(PyMongoError)
    def handle_database_error(error):
        return {
            "success": False,
            "message": "Database unavailable. Check the MongoDB connection and try again.",
        }, 503

    from .routes.auth import auth_bp
    from .routes.health import health_bp
    from .routes.posts import posts_bp
    from .routes.requests import requests_bp
    from .routes.chat import chat_bp
    from .routes.notifications import notifications_bp
    from .routes.users import users_bp
    from .routes.admin import admin_bp

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(posts_bp, url_prefix="/api/posts")
    app.register_blueprint(requests_bp, url_prefix="/api/requests")
    app.register_blueprint(chat_bp, url_prefix="/api/conversations")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app
