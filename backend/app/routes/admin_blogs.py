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
from ..utils.auth import permission_required
from ..utils.response import failure, success
from ..services.notification_service import create_notification


admin_blogs_bp = Blueprint("admin_blogs", __name__)


@admin_blogs_bp.get("")
@permission_required("blogs.manage")
def get_admin_blogs():
    return success({"blogs": list_admin_blogs()}, "Blogs fetched.")


@admin_blogs_bp.post("")
@permission_required("blogs.manage")
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
    if blog.get("status") == "published":
        create_notification("New CampusConnect story", f"{blog.get('title', 'A new blog')} is now published.", "blog", f"/blog/{blog.get('slug')}", roles=["student", "club_head"])
    else:
        create_notification("Blog draft created", f"A new blog draft is ready: {blog.get('title', 'Untitled blog')}.", "draft", "/dashboard/admin/blogs", roles=["admin"])
    return success({"blog": serialize_blog(blog)}, "Blog draft created.", 201)


@admin_blogs_bp.patch("/order")
@permission_required("blogs.manage")
def update_blog_order():
    data = request.get_json(silent=True) or {}
    try:
        reorder_blogs(data.get("blog_ids"))
    except ValueError as error:
        return failure(str(error), 400)
    return success({"blogs": list_admin_blogs()}, "Blog order updated.")


@admin_blogs_bp.patch("/<blog_id>")
@permission_required("blogs.manage")
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
    if blog.get("status") == "published" and existing.get("status") != "published":
        create_notification("New CampusConnect story", f"{blog.get('title', 'A new blog')} is now published.", "blog", f"/blog/{blog.get('slug')}", roles=["student", "club_head"])
    elif blog.get("status") == "draft" and existing.get("status") != "draft":
        create_notification("Blog moved to drafts", f"{blog.get('title', 'A blog')} is now a draft.", "draft", "/dashboard/admin/blogs", roles=["admin"])
    return success({"blog": serialize_blog(blog)}, "Blog updated.")


@admin_blogs_bp.delete("/<blog_id>")
@permission_required("blogs.manage")
def delete_blog(blog_id):
    object_id = parse_object_id(blog_id)
    if not object_id:
        return failure("Invalid blog ID.", 400)

    result = mongo.db.blogs.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return failure("Blog not found.", 404)

    return success({}, "Blog deleted.")
