from bson import ObjectId


def serialize_document(document):
    if not document:
        return None

    return {
        **document,
        "_id": str(document["_id"]) if document.get("_id") else None,
    }
