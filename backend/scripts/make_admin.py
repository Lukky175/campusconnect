import sys
from datetime import datetime, timezone

from app import create_app
from app.extensions import mongo


def make_admin(email):
    app = create_app()

    with app.app_context():
        email = email.strip().lower()

        user = mongo.db.users.find_one({
            "email": email,
        })

        if not user:
            print(
                f"No user found with email: {email}"
            )
            return

        mongo.db.users.update_one(
            {
                "_id": user["_id"],
            },
            {
                "$set": {
                    "role": "admin",
                    "is_active": True,
                    "updated_at": datetime.now(
                        timezone.utc
                    ),
                }
            },
        )

        print(
            f"{email} is now an admin."
        )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(
            "Usage: python -m scripts.make_admin "
            "your-email@example.com"
        )
        raise SystemExit(1)

    make_admin(sys.argv[1])



# python -m scripts.make_admin admin@lukky.in