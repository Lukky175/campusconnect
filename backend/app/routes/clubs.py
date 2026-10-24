import re
from datetime import datetime, timezone
from urllib.parse import urlparse

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from pymongo.errors import DuplicateKeyError

from ..services.club_service import (
    list_clubs_with_details,
    list_public_clubs,
)
from ..extensions import mongo
from ..utils.auth import permission_required
from ..utils.response import failure, success
from ..services.notification_service import create_notification


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


def _slug(value):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", str(value or "").strip().lower())).strip("-")


def _admin_club(document):
    result = {key: document.get(key) for key in ("name", "short_name", "slug", "category", "summary", "description", "focus_areas", "links", "status", "display_order")}
    result["_id"] = str(document["_id"])
    for key in ("created_at", "updated_at"):
        result[key] = document.get(key).isoformat() if document.get(key) else None
    return result


@clubs_bp.get("/admin")
@permission_required("clubs.manage")
def get_admin_clubs():
    clubs = mongo.db.clubs.find({}).sort([("display_order", 1), ("name", 1)])
    return success({"clubs": [_admin_club(club) for club in clubs]}, "Club records fetched.")


@clubs_bp.post("/admin")
@permission_required("clubs.manage")
def create_club():
    return _save_club()


@clubs_bp.patch("/admin/<club_id>")
@permission_required("clubs.manage")
def update_club(club_id):
    try:
        object_id = ObjectId(club_id)
    except (InvalidId, TypeError):
        return failure("Invalid club ID.", 400)
    if not mongo.db.clubs.find_one({"_id": object_id}):
        return failure("Club not found.", 404)
    return _save_club(object_id)


@clubs_bp.delete("/admin/<club_id>")
@permission_required("clubs.manage")
def delete_club(club_id):
    try:
        object_id = ObjectId(club_id)
    except (InvalidId, TypeError):
        return failure("Invalid club ID.", 400)
    result = mongo.db.clubs.delete_one({"_id": object_id})
    if not result.deleted_count:
        return failure("Club not found.", 404)
    return success({}, "Club deleted.")


def _save_club(object_id=None):
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    slug = _slug(data.get("slug") or name)
    status = str(data.get("status", "published")).strip().lower()
    if not name or not slug:
        return failure("Club name is required.", 400)
    if status not in {"draft", "published", "inactive"}:
        return failure("Status must be draft, published, or inactive.", 400)
    if mongo.db.clubs.find_one({"slug": slug, **({"_id": {"$ne": object_id}} if object_id else {})}, {"_id": 1}):
        return failure("A club with this slug already exists.", 409)
    raw_links = data.get("links", [])
    links = []
    if isinstance(raw_links, list):
        for item in raw_links:
            if not isinstance(item, dict) or not item.get("label") or not item.get("url"):
                continue
            url = str(item["url"]).strip()[:500]
            if urlparse(url).scheme not in {"https", "http"} or not urlparse(url).netloc:
                return failure("Club links must use a valid HTTPS or HTTP URL.", 400)
            links.append({"label": str(item["label"]).strip()[:60], "url": url})
    try:
        display_order = max(0, min(10000, int(data.get("display_order", 0) or 0)))
    except (ValueError, TypeError):
        return failure("Display order must be a whole number.", 400)
    fields = {
        "name": name[:120], "short_name": str(data.get("short_name", "")).strip()[:60],
        "slug": slug[:140], "category": str(data.get("category", "Technology")).strip()[:100],
        "summary": str(data.get("summary", "")).strip()[:300], "description": str(data.get("description", "")).strip()[:5000],
        "focus_areas": [str(item).strip()[:80] for item in data.get("focus_areas", []) if str(item).strip()][:20] if isinstance(data.get("focus_areas", []), list) else [],
        "links": links[:20],
        "status": status,
        "display_order": display_order,
        "updated_at": datetime.now(timezone.utc),
    }
    if not fields["summary"]:
        fields["summary"] = fields["description"][:240]
    now = datetime.now(timezone.utc)
    previous_status = None
    if object_id:
        previous = mongo.db.clubs.find_one({"_id": object_id}, {"status": 1})
        previous_status = previous.get("status") if previous else None
        update = {"$set": fields}
    else:
        fields["created_at"] = now
        update = {"$set": fields}
    try:
        if object_id:
            mongo.db.clubs.update_one({"_id": object_id}, update)
            document = mongo.db.clubs.find_one({"_id": object_id})
            if status == "published" and previous_status != "published":
                create_notification("New tech club", f"{document.get('name', 'A tech club')} is now in the club directory.", "club", "/dashboard/clubs", roles=["student", "club_head"])
            return success({"club": _admin_club(document)}, "Club updated.")
        result = mongo.db.clubs.insert_one(fields)
        fields["_id"] = result.inserted_id
        if status == "published":
            create_notification("New tech club", f"{fields['name']} is now in the club directory.", "club", "/dashboard/clubs", roles=["student", "club_head"])
        return success({"club": _admin_club(fields)}, "Club created.", 201)
    except (DuplicateKeyError,):
        return failure("A club with this slug already exists.", 409)
