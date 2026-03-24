"""
fcm.py — Send push notifications via Firebase Cloud Messaging.
Reads all FCM tokens from Firestore (one per device, saved by the frontend).

Two-tier duplicate prevention:
  1. Firestore is_pushed flag — skip campaigns already dispatched.
  2. FCM tag (collapse_key) — collapses duplicate notifications on-device.
"""

import hashlib
from db.firestore import _get_db
from firebase_admin import messaging

ADPRISM_URL = "https://cynhs.github.io/adprism/"
ADPRISM_ICON = ADPRISM_URL + "apple-touch-icon.png"


def _get_all_tokens():
    """Return a deduplicated list of (doc_id, token) for every registered device."""
    docs = _get_db().collection("fcm_tokens").stream()
    tokens = []
    seen_tokens = set()
    for d in docs:
        tok = d.to_dict().get("token")
        if tok and d.id != "owner" and tok not in seen_tokens:
            tokens.append((d.id, tok))
            seen_tokens.add(tok)
    # Fallback: if no per-device docs exist yet, use the legacy "owner" doc
    if not tokens:
        owner = _get_db().collection("fcm_tokens").document("owner").get()
        if owner.exists:
            tok = owner.to_dict().get("token")
            if tok:
                tokens.append(("owner", tok))
    return tokens


def _campaign_doc_id(campaign: dict) -> str:
    """Derive Firestore doc ID the same way save_campaign does."""
    return hashlib.md5(campaign["source_url"].encode()).hexdigest()


def _filter_unpushed(campaigns: list) -> list:
    """Return only campaigns whose Firestore doc has is_pushed != True."""
    db = _get_db()
    unpushed = []
    for c in campaigns:
        doc_id = _campaign_doc_id(c)
        doc = db.collection("campaigns").document(doc_id).get()
        if doc.exists and doc.to_dict().get("is_pushed"):
            continue
        unpushed.append(c)
    return unpushed


def _mark_pushed(campaigns: list):
    """Set is_pushed=True on each campaign's Firestore document."""
    db = _get_db()
    for c in campaigns:
        doc_id = _campaign_doc_id(c)
        db.collection("campaigns").document(doc_id).update({"is_pushed": True})


def notify_summary(campaigns: list):
    # Primary defence: skip campaigns already pushed
    campaigns = _filter_unpushed(campaigns)

    if not campaigns:
        print("  ⚠ No unpushed campaigns — skipping FCM notification")
        return

    tokens = _get_all_tokens()
    if not tokens:
        print("  ⚠ No FCM tokens found — skipping push notification")
        return

    count = len(campaigns)
    lines = []
    for c in campaigns[:5]:
        brand = c.get("brand", "")
        t = c.get("title") or c.get("title_zh", "")
        lines.append(f"{brand} — {t}")
    body = "\n".join(lines)
    if count > 5:
        body += f"\n…and {count - 5} more"
    title = f"AdPrism — {count} new card{'s' if count != 1 else ''}"

    # Secondary defence: fixed tag collapses stale notifications on-device
    tag = "adprism-summary"

    any_sent = False
    for doc_id, token in tokens:
        try:
            msg_id = messaging.send(messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        icon=ADPRISM_ICON,
                        tag=tag,
                    ),
                    fcm_options=messaging.WebpushFCMOptions(
                        link=ADPRISM_URL,
                    ),
                ),
                token=token,
            ))
            any_sent = True
            print(f"  ✓ FCM push sent to {doc_id} ({count} cards) — {msg_id}")
        except messaging.UnregisteredError:
            print(f"  ✗ Token expired for {doc_id} — removing")
            _get_db().collection("fcm_tokens").document(doc_id).delete()
        except Exception as e:
            print(f"  ✗ FCM push failed for {doc_id}: {e}")

    # Only mark pushed if at least one device received the notification
    if any_sent:
        _mark_pushed(campaigns)
        print(f"  ✓ Marked {count} campaigns as is_pushed=True")
    else:
        print(f"  ⚠ All sends failed — campaigns NOT marked as pushed (will retry next run)")
