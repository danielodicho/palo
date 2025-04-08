def run(classified_data):
    # Store to a database, S3, or local JSON for now
    import json
    with open("output/classified_media.json", "w") as f:
        json.dump(classified_data, f, indent=2)
    return "Stored successfully"
