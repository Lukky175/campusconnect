from flask import Blueprint
from ..extensions import mongo

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    try:
        mongo.db.command("ping")
        database = "connected"
    except Exception:
        database = "unavailable"

    return {
        "success": True,
        "service": "campusconnect-api",
        "database": database,
    }
