from ..extensions import mongo
from ..utils.serializers import serialize_document


PUBLIC_FIELDS = {
    "slug": 1,
    "name": 1,
    "short_name": 1,
    "category": 1,
    "summary": 1,
    "display_order": 1,
}

DETAIL_FIELDS = {
    **PUBLIC_FIELDS,
    "description": 1,
    "focus_areas": 1,
    "links": 1,
}


def _list_clubs(projection):
    documents = mongo.db.clubs.find(
        {"status": "published"},
        projection,
    ).sort([("display_order", 1), ("name", 1)])

    return [serialize_document(document) for document in documents]


def list_public_clubs():
    """Return the limited, anonymous club directory fields."""
    return _list_clubs(PUBLIC_FIELDS)


def list_clubs_with_details():
    """Return full club descriptions and links to authenticated users."""
    return _list_clubs(DETAIL_FIELDS)
