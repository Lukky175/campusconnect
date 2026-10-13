
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..services.event_service import (
    get_published_event,
    list_published_events,
)
from ..utils.auth import (
    get_current_user,
    permission_required,
)
from ..utils.response import failure, success


events_bp = Blueprint("events", __name__)


@events_bp.get("")
def get_events():
    try:
        events = list_published_events()
        return success({"events": events}, "Events fetched.")
    except Exception:
        return failure("Unable to fetch events right now.", 500)


@events_bp.get("/<identifier>")
def get_event(identifier):
    try:
        event = get_published_event(identifier)
    except Exception:
        return failure("Unable to fetch the event right now.", 500)

    if not event:
        return failure("Event not found.", 404)

    return success({"event": event}, "Event fetched.")


@events_bp.post("/<event_id>/register")
@permission_required("registrations.create")
def register_for_event(event_id):
    """
    Register the authenticated user for a published event.

    The student identity is obtained from the authenticated
    MongoDB user, never from the request payload.
    """
    user = get_current_user()

    if not user:
        return failure("Authenticated user not found.", 401)

    if user.get("role") not in {"student", "club_head"}:
        return failure("Only students can register for events.", 403)

    try:
        event = get_published_event(event_id)
    except Exception:
        return failure("Unable to fetch the event right now.", 500)

    if not event:
        return failure("Event not found or registration is unavailable.", 404)

    # Resolve the event to its real MongoDB document.
    event_query = (
        {"_id": ObjectId(event_id)}
        if ObjectId.is_valid(event_id)
        else {"slug": event_id}
    )

    event_document = mongo.db.events.find_one({
        **event_query,
        "status": "published",
    })

    if not event_document:
        return failure("Event not found or registration is unavailable.", 404)

    now = datetime.now(timezone.utc)

    # If a registration deadline is configured, enforce it.
    deadline = event_document.get("registration_deadline")

    if deadline:
        try:
            if isinstance(deadline, str):
                parsed_deadline = datetime.fromisoformat(
                    deadline.replace("Z", "+00:00")
                )
            else:
                parsed_deadline = deadline

            if parsed_deadline.tzinfo is None:
                parsed_deadline = parsed_deadline.replace(
                    tzinfo=timezone.utc
                )

            if now > parsed_deadline:
                return failure("The registration deadline has passed.", 400)

        except (ValueError, TypeError):
            return failure("The event has an invalid registration deadline.", 400)

    registration = {
        "event_id": event_document["_id"],
        "student_id": user["_id"],
        "status": "registered",
        "registered_at": now,
        "updated_at": now,
    }

    try:
        result = mongo.db.registrations.insert_one(registration)
    except DuplicateKeyError:
        return failure("You are already registered for this event.", 409)
    except Exception:
        return failure("Unable to complete registration right now.", 500)

    registration["_id"] = result.inserted_id

    return success(
        {
            "registration": {
                "_id": str(registration["_id"]),
                "event_id": str(registration["event_id"]),
                "student_id": str(registration["student_id"]),
                "status": registration["status"],
                "registered_at": now.isoformat(),
            }
        },
        "Successfully registered for the event.",
        201,
    )
