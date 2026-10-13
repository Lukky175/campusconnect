from flask import Blueprint
from flask_jwt_extended import jwt_required

from ..services.club_service import (
    list_clubs_with_details,
    list_public_clubs,
)
from ..utils.response import failure, success


clubs_bp = Blueprint("clubs", __name__)


@clubs_bp.get("")
def get_public_clubs():
    try:
        clubs = list_public_clubs()
        return success({"clubs": clubs}, "Clubs fetched.")
    except Exception:
        return failure("Unable to fetch clubs right now.", 500)


@clubs_bp.get("/details")
@jwt_required()
def get_clubs_with_details():
    try:
        clubs = list_clubs_with_details()
        return success({"clubs": clubs}, "Club details fetched.")
    except Exception:
        return failure("Unable to fetch club details right now.", 500)
