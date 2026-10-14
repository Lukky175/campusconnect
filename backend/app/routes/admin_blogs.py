from datetime import datetime, timezone

from flask import Blueprint, request
from pymongo.errors import DuplicateKeyError

from ..extensions import mongo
from ..services.blog_service import (
    build_blog_document,
    list_admin_blogs,
    parse_object_id,
    reorder_blogs,
    serialize_blog,
)
from ..utils.auth import role_required
from ..utils.response import failure, success


admin_blogs_bp = Blueprint("admin_blogs", __name__)


@admin_blogs_bp.get("")
@role_required("admin")
def get_admin_blogs():
    return success({"blogs": list_admin_blogs()}, "Blogs fetched.")


@admin_blogs_bp.post("")
@role_required("admin")
def create_blog():
    data = request.get_json(silent=True) or {}
    try:
        document = build_blog_document(data, creating=True)
    except ValueError as error:
        return failure(str(error), 400)

    now = datetime.now(timezone.utc)
    document.update({"created_at": now, "updated_at": now})
    if document["status"] == "published":
        document["published_at"] = now

    try:
        result = mongo.db.blogs.insert_one(document)
    except DuplicateKeyError:
        return failure("A blog with this slug already exists.", 409)

    blog = mongo.db.blogs.find_one({"_id": result.inserted_id})
    return success({"blog": serialize_blog(blog)}, "Blog draft created.", 201)


@admin_blogs_bp.patch("/order")
@role_required("admin")
def update_blog_order():
    data = request.get_json(silent=True) or {}
    try:
        reorder_blogs(data.get("blog_ids"))
    except ValueError as error:
        return failure(str(error), 400)
    return success({"blogs": list_admin_blogs()}, "Blog order updated.")


@admin_blogs_bp.patch("/<blog_id>")
@role_required("admin")
def update_blog(blog_id):
    object_id = parse_object_id(blog_id)
    if not object_id:
        return failure("Invalid blog ID.", 400)

    existing = mongo.db.blogs.find_one({"_id": object_id})
    if not existing:
        return failure("Blog not found.", 404)

    data = request.get_json(silent=True) or {}
    try:
        update = build_blog_document(data, existing=existing)
    except ValueError as error:
        return failure(str(error), 400)

    if not update:
        return failure("No blog fields were provided.", 400)

    now = datetime.now(timezone.utc)
    update["updated_at"] = now
    if update.get("status") == "published" and existing.get("status") != "published":
        update["published_at"] = now

    try:
        mongo.db.blogs.update_one({"_id": object_id}, {"$set": update})
    except DuplicateKeyError:
        return failure("A blog with this slug already exists.", 409)

    blog = mongo.db.blogs.find_one({"_id": object_id})
    return success({"blog": serialize_blog(blog)}, "Blog updated.")


@admin_blogs_bp.delete("/<blog_id>")
@role_required("admin")
def delete_blog(blog_id):
    object_id = parse_object_id(blog_id)
    if not object_id:
        return failure("Invalid blog ID.", 400)

    result = mongo.db.blogs.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return failure("Blog not found.", 404)

    return success({}, "Blog deleted.")
