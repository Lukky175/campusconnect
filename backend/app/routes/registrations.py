
from datetime import datetime, timezone

from bson import ObjectId
from flask import Blueprint

from ..extensions import mongo
from ..utils.auth import (
    get_current_user,
    permission_required,
)
from ..utils.response import failure, success


registrations_bp = Blueprint(
    "registrations",
    __name__,
)


def serialize_registration(registration, event):
    registered_at = registration.get("registered_at")
    updated_at = registration.get("updated_at")

    return {
        "_id": str(registration["_id"]),
        "event_id": str(registration["event_id"]),
        "student_id": str(registration["student_id"]),
        "status": registration.get("status", "registered"),
        "registered_at": (
            registered_at.isoformat()
            if hasattr(registered_at, "isoformat")
            else registered_at
        ),
        "updated_at": (
            updated_at.isoformat()
            if hasattr(updated_at, "isoformat")
            else updated_at
        ),
        "event": event,
    }


@registrations_bp.get("/me")
@permission_required("registrations.view_own")
def get_my_registrations():
    user = get_current_user()

    if not user:
        return failure("Authenticated user not found.", 401)

    try:
        records = list(
            mongo.db.registrations.find({
                "student_id": user["_id"],
            }).sort("registered_at", -1)
        )

        registrations = []

        for record in records:
            event_document = mongo.db.events.find_one({
                "_id": record["event_id"],
            })

            if not event_document:
                event = None
            else:
                event = {
                    "_id": str(event_document["_id"]),
                    "title": event_document.get("title", ""),
                    "slug": event_document.get("slug", ""),
                    "type": event_document.get("type", ""),
                    "description": event_document.get("description", ""),
                    "mode": event_document.get("mode", ""),
                    "location": event_document.get("location", ""),
                    "college": event_document.get("college", ""),
                    "organizer": event_document.get("organizer", ""),
                    "start_date": event_document.get("start_date"),
                    "end_date": event_document.get("end_date"),
                    "date": event_document.get("date"),
                    "status": event_document.get("status", ""),
                }

                for field in ("start_date", "end_date"):
                    value = event.get(field)
                    if hasattr(value, "isoformat"):
                        event[field] = value.isoformat()

            registrations.append(
                serialize_registration(record, event)
            )

        return success(
            {"registrations": registrations},
            "Registrations fetched.",
        )

    except Exception:
        return failure(
            "Unable to fetch registrations right now.",
            500,
        )


@registrations_bp.delete("/<registration_id>")
@permission_required("registrations.view_own")
def cancel_registration(registration_id):
    user = get_current_user()

    if not user:
        return failure("Authenticated user not found.", 401)

    try:
        object_id = ObjectId(registration_id)
    except Exception:
        return failure("Invalid registration ID.", 400)

    registration = mongo.db.registrations.find_one({
        "_id": object_id,
        "student_id": user["_id"],
    })

    if not registration:
        return failure("Registration not found.", 404)

    if registration.get("status") == "cancelled":
        return failure("This registration is already cancelled.", 409)

    now = datetime.now(timezone.utc)

    mongo.db.registrations.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": now,
            }
        },
    )

    return success(
        {
            "registration": {
                "_id": str(object_id),
                "status": "cancelled",
                "updated_at": now.isoformat(),
            }
        },
        "Registration cancelled.",
    )
