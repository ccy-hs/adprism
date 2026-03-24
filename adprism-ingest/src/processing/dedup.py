"""
dedup.py — Prevent re-processing already saved URLs.
Uses SQLite for persistent, reliable deduplication.
"""

import hashlib
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "seen.db"


def _get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS seen_urls (
            url_hash TEXT PRIMARY KEY,
            url      TEXT,
            seen_at  TEXT DEFAULT (datetime('now'))
        )
    """)
    return conn


def is_duplicate(url: str) -> bool:
    """Return True if this URL has already been processed."""
    h = hashlib.md5(url.encode()).hexdigest()
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT 1 FROM seen_urls WHERE url_hash = ?", (h,)
        ).fetchone()
        if row:
            return True
        conn.execute(
            "INSERT INTO seen_urls (url_hash, url) VALUES (?, ?)", (h, url)
        )
        conn.commit()
        return False
    finally:
        conn.close()
