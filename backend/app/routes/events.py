from flask import Blueprint, request

from ..services.event_service import (
    create_event,
    get_published_event,
    list_published_events,
)

from ..utils.response import (
    failure,
    success,
)


events_bp = Blueprint(
    "events",
    __name__
)


@events_bp.get("")
def get_events():

    try:

        events = list_published_events()

        return success(
            {
                "events": events
            },
            "Events fetched."
        )

    except Exception:

        return failure(
            "Unable to fetch events right now.",
            500
        )


@events_bp.get("/<identifier>")
def get_event(identifier):

    try:

        event = get_published_event(
            identifier
        )

    except Exception:

        return failure(
            "Unable to fetch the event right now.",
            500
        )


    if not event:

        return failure(
            "Event not found.",
            404
        )


    return success(
        {
            "event": event
        },
        "Event fetched."
    )