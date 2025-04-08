import instaloader

def run(handles):
    # You can later expand this to use Puppeteer/Playwright or APIs
    scraped_data = []
    for handle in handles:
        if "instagram.com" in handle:
            # scrape Instagram logic
            L = instaloader.Instaloader()
            username = handle.split('/')[-1]  # Extract username from URL
            try:
                profile = instaloader.Profile.from_username(L.context, username)
                posts_text = []
                for post in profile.get_posts():
                    posts_text.append(post.caption or "")  # Get caption text or empty if none
                scraped_data.append({
                    'username': profile.username,
                    'followers': profile.followers,
                    'following': profile.followees,
                    'posts': profile.mediacount,
                    'posts_text': posts_text
                })
            except Exception as e:
                print(f"Error scraping {handle}: {e}")
        elif "linkedin.com" in handle:
            # scrape LinkedIn logic
            pass
        elif "x.com" in handle or "twitter.com" in handle:
            # scrape X logic
            pass
        # Add others like TikTok, YouTube etc.
    return scraped_data

print(run(["https://www.instagram.com/odichodaniel"]))