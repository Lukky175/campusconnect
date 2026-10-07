from flask import current_app
from pymongo import MongoClient


class MongoExtension:
    def init_app(self, app):
        app.extensions["mongo_client"] = MongoClient(
            app.config["MONGO_URI"],
            serverSelectionTimeoutMS=5000,
        )

    @property
    def db(self):
        client = current_app.extensions["mongo_client"]
        return client[current_app.config["MONGO_DB_NAME"]]


mongo = MongoExtension()
