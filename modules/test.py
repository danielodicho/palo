from apify_client import ApifyClient
import json

# === SETUP ===
client = ApifyClient("apify_api_TpZldq2AyDjZTPeJcvQn9EyHxjVGmU35KZOl")

run_input = {
    "directUrls": ["https://www.instagram.com/odichodaniel/"],
    "resultsType": "posts",
    "resultsLimit": 10,
    "searchType": "user",
    "searchLimit": 1,
    "addParentData": False,
}

run = client.actor("shu8hvrXbJbY3Eb9W").call(run_input=run_input)

parsed_posts = []

for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    post_type = item.get("type", "").lower()
    media_category = "text"

    if post_type == "video" or item.get("videoUrl"):
        media_category = "video"
    elif post_type == "sidecar":
        media_category = "carousel"
    elif post_type == "image" or item.get("displayUrl"):
        media_category = "image"

    post_data = {
        "id": item.get("id"),
        "type": media_category,
        "caption": item.get("caption", "").strip(),
        "url": item.get("url"),
        "timestamp": item.get("timestamp"),
        "likes": item.get("likesCount", 0),
        "comments": item.get("commentsCount", 0),
        "hashtags": item.get("hashtags", []),
        "mentions": item.get("mentions", []),
        "media": {
            "image": item.get("displayUrl"),
            "video": item.get("videoUrl"),
            "images": item.get("images", []),
            "video_views": item.get("videoViewCount"),
            "video_plays": item.get("videoPlayCount"),
            "duration": item.get("videoDuration")
        },
        "comments_sample": [comment["text"] for comment in item.get("latestComments", [])],
        "tagged_users": [u["username"] for u in item.get("taggedUsers", [])],
        "music": item.get("musicInfo", {}).get("song_name"),
        "owner": {
            "username": item.get("ownerUsername"),
            "id": item.get("ownerId"),
            "full_name": item.get("ownerFullName")
        }
    }

    parsed_posts.append(post_data)

# === SAVE OR RETURN RESULTS ===
with open("parsed_instagram_posts.json", "w") as f:
    json.dump(parsed_posts, f, indent=2)

print(f"✅ Parsed {len(parsed_posts)} posts and saved to file.")
