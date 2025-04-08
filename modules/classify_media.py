def run(media_data):
    multimedia = {
        "images": [],
        "videos": [],
        "text": []
    }
    for item in media_data:
        if item.get("type") == "image":
            multimedia["images"].append(item)
        elif item.get("type") == "video":
            multimedia["videos"].append(item)
        elif item.get("type") == "text":
            multimedia["text"].append(item)
    return multimedia
