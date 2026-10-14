from flask import Blueprint

from ..services.blog_service import get_public_blog, list_public_blogs
from ..utils.response import failure, success


blogs_bp = Blueprint("blogs", __name__)


@blogs_bp.get("")
def get_blogs():
    try:
        return success({"blogs": list_public_blogs()}, "Blogs fetched.")
    except Exception:
        return failure("Unable to fetch blogs right now.", 500)


@blogs_bp.get("/<slug>")
def get_blog(slug):
    try:
        blog = get_public_blog(slug)
    except Exception:
        return failure("Unable to fetch the blog right now.", 500)

    if not blog:
        return failure("Blog not found.", 404)

    return success({"blog": blog}, "Blog fetched.")
