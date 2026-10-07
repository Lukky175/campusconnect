from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from .config import Config
from .extensions import mongo
from .routes.health import health_bp
from .routes.auth import auth_bp
from .routes.events import events_bp

from .routes.admin_users import admin_users_bp
from .routes.admin_roles import admin_roles_bp
from .routes.admin_events import admin_events_bp


jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"]
            }
        },
    )

    mongo.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(
        health_bp,
        url_prefix="/api",
    )

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth",
    )

    app.register_blueprint(
        events_bp,
        url_prefix="/api/events",
    )

    app.register_blueprint(
        admin_users_bp,
        url_prefix="/api/admin/users",
    )

    app.register_blueprint(
        admin_roles_bp,
        url_prefix="/api/admin/roles",
    )

    app.register_blueprint(
        admin_events_bp,
        url_prefix="/api/admin/events",
    )

    @app.errorhandler(404)
    def handle_not_found(_error):
        return {
            "success": False,
            "message": "The requested API endpoint was not found.",
        }, 404

    @app.errorhandler(500)
    def handle_server_error(_error):
        return {
            "success": False,
            "message": "An internal server error occurred.",
        }, 500

    

    return app