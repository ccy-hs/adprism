"""
prioritise.py — Sort all items by recency (newest first).

No daily quota, no seasonal filter, no tier-based ordering.
All new items are returned sorted by published date.
"""


def prioritise_and_cap(items: list) -> list:
    """
    Sort all items by recency (newest first) and return them all.
    """
    items.sort(key=lambda x: x.get("published_at") or "", reverse=True)
    return items
