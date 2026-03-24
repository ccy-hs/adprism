"""
AdPrism Ingestion Pipeline
Fetches all new content, processes via AI, and saves to Firestore.
Run manually: python src/main.py
"""

import sys
import os
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# Ensure src/ is on the path
sys.path.insert(0, str(Path(__file__).resolve().parent))

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import config
from sources.youtube import fetch_youtube_feeds
from sources.rss import fetch_rss_feeds
from processing.dedup import is_duplicate
from processing.prioritise import prioritise_and_cap
from processing.claude import tag_and_summarise
from db.firestore import save_campaign, cleanup_old_campaigns
from notify.fcm import notify_summary as fcm_summary


def run():
    skip_dedup = "--no-dedup" in sys.argv
    today_only = "--recent" in sys.argv or "--today" in sys.argv
    backfill = "--backfill" in sys.argv

    # Custom hour window: --hours N
    custom_hours = None
    if "--hours" in sys.argv:
        idx = sys.argv.index("--hours")
        if idx + 1 < len(sys.argv):
            custom_hours = int(sys.argv[idx + 1])
            today_only = True
            skip_dedup = True

    # Source filter: --source <name>
    source_filter = None
    if "--source" in sys.argv:
        idx = sys.argv.index("--source")
        if idx + 1 < len(sys.argv):
            source_filter = sys.argv[idx + 1].lower()

    print("▶ AdPrism ingestion starting…")
    if source_filter:
        print(f"  🔍 Source filter active: '{source_filter}'")
    if custom_hours:
        print(f"  ⚠ Custom window — last {custom_hours} hours, dedup skipped (--hours {custom_hours})")
    elif backfill:
        print("  ⚠ Backfill mode — last 12 hours, dedup skipped (--backfill)")
        skip_dedup = True
        today_only = True
    if skip_dedup and not custom_hours and not backfill:
        print("  ⚠ Dedup disabled (--no-dedup)")
    if today_only and not backfill and not custom_hours:
        print("  ⚠ Recent mode — last 40 minutes (--recent)")

    # 1. Fetch categories (optionally filtered by source name)
    cats = {
        1: config.CAT1_GLOBAL_BRANDS,
        2: config.CAT2_CLIENT_INDUSTRY,
        3: config.CAT3_LOCAL_BRANDS,
        4: config.CAT4_MEDIA,
        5: config.CAT5_PRODUCTION,
    }
    if source_filter:
        cats = {k: {name: v for name, v in d.items() if source_filter in name.lower()}
                for k, d in cats.items()}
        matched = sum(len(d) for d in cats.values())
        print(f"  🔍 Source filter '{source_filter}' matched {matched} source(s)")
        if matched == 0:
            print("  ✗ No sources matched — exiting")
            return

    cat1 = fetch_youtube_feeds(cats[1], category=1)
    cat2 = fetch_youtube_feeds(cats[2], category=2)
    cat3 = fetch_youtube_feeds(cats[3], category=3)
    cat4 = fetch_rss_feeds(cats[4], category=4)
    cat5 = fetch_youtube_feeds(cats[5], category=5)

    all_items = cat1 + cat2 + cat3 + cat4 + cat5
    print(f"  {len(all_items)} raw items fetched")

    # Filter by time window
    if today_only:
        from datetime import timedelta
        window = custom_hours or (12 if backfill else 40/60)
        cutoff = datetime.now(timezone.utc) - timedelta(hours=window)
        all_items = [
            item for item in all_items
            if isinstance(item.get("published_at"), datetime) and item["published_at"] >= cutoff
        ]
        print(f"  {len(all_items)} items from last {window} hours (since {cutoff.strftime('%Y-%m-%d %H:%M')} UTC)")

    # 2. Deduplicate
    if skip_dedup:
        fresh = all_items
    else:
        fresh = [item for item in all_items if not is_duplicate(item["url"])]
    print(f"  {len(fresh)} new items after dedup")

    # 3. Sort by recency (no cap)
    selected = prioritise_and_cap(fresh)
    print(f"  {len(selected)} items to process")

    # 4. AI process each item
    saved = []
    for item in selected:
        enriched = tag_and_summarise(item)
        if enriched:
            save_campaign(enriched)
            saved.append(enriched)

    print(f"  ✓ {len(saved)} new campaigns saved")

    # 5. Batch summary notification (FCM push)
    fcm_summary(saved)

    # 5. Data retention: clean up campaigns older than 3 years
    cleanup_old_campaigns()


if __name__ == "__main__":
    run()
