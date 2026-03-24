"""
firestore.py — Write campaigns to Firestore + data retention cleanup.
"""

import os
import hashlib
from datetime import datetime, timezone, timedelta

import firebase_admin
from firebase_admin import credentials, firestore

_db = None

RETENTION_YEARS = 3


def _get_db():
    global _db
    if _db is None:
        if not firebase_admin._apps:
            # Support JSON string (CI) or file path (local)
            json_str = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
            if json_str:
                import json
                cred = credentials.Certificate(json.loads(json_str))
            else:
                cred = credentials.Certificate(os.environ["FIREBASE_SERVICE_ACCOUNT_PATH"])
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db


def save_campaign(campaign: dict):
    """
    Uses a hash of the source URL as the document ID — natural deduplication.
    """
    doc_id = hashlib.md5(campaign["source_url"].encode()).hexdigest()
    _get_db().collection("campaigns").document(doc_id).set(campaign, merge=True)
    print(f"    → saved: {campaign.get('brand')} — {campaign.get('title', '')[:60]}")


def migrate_dismissed_collection():
    """
    One-time migration: read old 'dismissed' collection docs, set dismissed=True
    on the matching campaign, then delete the dismissed doc. Idempotent.
    """
    db = _get_db()
    docs = list(db.collection("dismissed").stream())
    if not docs:
        return
    print(f"  ⚙ Migrating {len(docs)} entries from dismissed collection…")
    for d in docs:
        db.collection("campaigns").document(d.id).set(
            {"dismissed": True}, merge=True
        )
        d.reference.delete()
    print(f"  ✓ Migrated {len(docs)} dismissed entries → dismissed field on campaigns")


def delete_all_campaigns():
    """Delete all documents in the campaigns collection."""
    db = _get_db()
    docs = db.collection("campaigns").stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    print(f"    → deleted {count} old campaigns")


def migrate_industry_labels():
    """Rename abbreviated industry labels to full names. Idempotent."""
    RENAMES = {"Tech": "Technology", "Auto": "Automotive", "F&B": "Food & Beverage"}
    db = _get_db()
    count = 0
    for doc in db.collection("campaigns").stream():
        old = doc.to_dict().get("industry")
        if old in RENAMES:
            doc.reference.update({"industry": RENAMES[old]})
            count += 1
    if count:
        print(f"  ✓ Migrated {count} industry labels")


def cleanup_old_campaigns():
    """Delete campaigns older than RETENTION_YEARS (3 years), unless user-saved."""
    db = _get_db()
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_YEARS * 365)
    old_docs = (
        db.collection("campaigns")
        .where("published_at", "<", cutoff)
        .stream()
    )
    count = 0
    for doc in old_docs:
        data = doc.to_dict()
        if data.get("saved"):
            continue  # Skip user-saved campaigns
        doc.reference.delete()
        count += 1
    if count:
        print(f"    → cleaned up {count} campaigns older than {RETENTION_YEARS} years")
