"""
rss.py — Generic RSS feed fetcher.
Used for Tier 4 (Taiwan media) and Tier 5 (global media).
"""

import feedparser
import trafilatura
from datetime import datetime, timezone

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def fetch_rss_feeds(feed_map: dict, category: int, region_hint: str = None) -> list:
    """
    feed_map:     { "Source Name": "https://rss-url", ... }
    category:     category number (1-4)
    region_hint:  optional region hint (e.g. "Taiwan") passed to AI
    Returns list of items with keys: url, source_name, raw_text, published_at, category, region_hint
    """
    items = []
    for source_name, url in feed_map.items():
        try:
            feed = feedparser.parse(url, agent=USER_AGENT)
            for entry in feed.entries[:15]:
                raw = trafilatura.fetch_url(entry.link)
                text = trafilatura.extract(raw) if raw else None
                if not text:
                    text = entry.get("summary", "")

                pub = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                else:
                    pub = datetime.now(timezone.utc)

                item = {
                    "url":          entry.link,
                    "source_name":  source_name,
                    "raw_text":     text,
                    "published_at": pub,
                    "category":         category,
                }
                if region_hint:
                    item["region_hint"] = region_hint

                items.append(item)
        except Exception as e:
            print(f"  ✗ RSS fetch error for {source_name}: {e}")
    return items
