"""
youtube.py — Fetch YouTube channel RSS feeds (Atom format).
Used for Tier 1 (seasonal global), Tier 2 (TW brands), Tier 3 (JP/KR/global brands).
"""

import re
import feedparser
import requests
from datetime import datetime, timezone

YT_RSS_BY_ID = "https://www.youtube.com/feeds/videos.xml?channel_id={}"


def _resolve_handle(handle: str):
    """Resolve a @handle to a UC... channel ID by scraping the channel page."""
    try:
        resp = requests.get(
            f"https://www.youtube.com/{handle}",
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
        )
        # Look for channel ID in page source
        match = re.search(r'"externalId"\s*:\s*"(UC[a-zA-Z0-9_-]{22})"', resp.text)
        if match:
            return match.group(1)
    except Exception:
        pass
    return None


def fetch_youtube_feeds(channel_map: dict, category: int) -> list:
    """
    channel_map: { "Brand Name": "UCxxxxx" or "@handle", ... }
    category: category number (1-5)
    Returns list of items with keys: url, source_name, raw_text, published_at, category
    """
    items = []
    for brand_name, channel_ref in channel_map.items():
        if not channel_ref or channel_ref.startswith("PLACEHOLDER"):
            continue

        # Resolve @handles to channel IDs, with fallback
        if channel_ref.startswith("@"):
            resolved = _resolve_handle(channel_ref)
            if not resolved:
                print(f"  ✗ Could not resolve handle {channel_ref} for {brand_name}")
                continue
            channel_id = resolved
        else:
            channel_id = channel_ref

        url = YT_RSS_BY_ID.format(channel_id)
        try:
            feed = feedparser.parse(url)
            # If UC... ID returns no entries, try resolving via @handle fallback
            if not feed.entries and not channel_ref.startswith("@"):
                print(f"  ↻ No entries for {channel_id}, trying handle resolution for {brand_name}...")
                # Try to find the @handle from the channel page
                try:
                    resp = requests.get(
                        f"https://www.youtube.com/channel/{channel_id}",
                        headers={"User-Agent": "Mozilla/5.0"},
                        timeout=10,
                    )
                    match = re.search(r'"canonicalBaseUrl":"(/@[^"]+)"', resp.text)
                    if match:
                        handle = match.group(1).lstrip("/")
                        resolved = _resolve_handle(handle)
                        if resolved and resolved != channel_id:
                            feed = feedparser.parse(YT_RSS_BY_ID.format(resolved))
                            print(f"    ✓ Resolved via {handle} → {resolved}")
                except Exception:
                    pass
            channel_title = feed.feed.get("title", brand_name) if hasattr(feed, "feed") else brand_name
            for entry in feed.entries[:15]:
                # YouTube Atom feeds provide title + media:description
                title = entry.get("title", "")
                # Description is in media_group or summary
                description = ""
                if hasattr(entry, "media_group"):
                    for mg in entry.media_group:
                        if hasattr(mg, "content"):
                            for c in mg.content:
                                if hasattr(c, "text"):
                                    description = c.text
                                    break
                if not description:
                    description = entry.get("summary", "")

                raw_text = f"{title}\n\n{description}"

                pub = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                else:
                    pub = datetime.now(timezone.utc)

                items.append({
                    "url":          entry.link,
                    "source_name":  channel_title,
                    "raw_text":     raw_text,
                    "published_at": pub,
                    "category":         category,
                })
        except Exception as e:
            print(f"  ✗ YouTube fetch error for {brand_name}: {e}")
    return items
