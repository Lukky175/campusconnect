def success(data=None, message="Success", status=200):
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return payload, status


def failure(message, status=400):
    return {"success": False, "message": message}, status
