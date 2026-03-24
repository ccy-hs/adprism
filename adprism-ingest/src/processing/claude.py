"""
claude.py — Tag and summarise each campaign item using Claude API (primary)
with Gemini as fallback. Outputs English briefs with strategic breakdown.
"""

import os
import json
import re
import time
from urllib.parse import urlparse, parse_qs

import requests

from config import BRAND_INDUSTRY_MAP

SYSTEM = """You are an advertising strategy analyst.
Given a thumbnail image (if available) and raw article or video description, first classify it into one content type,
then return a JSON object with COMMON fields plus TYPE-SPECIFIC fields.

STEP 1 — Classify as one of:
- "brand_campaign": A major ad campaign, brand film, TVC, product launch, or branded content release.
- "industry_news": Agency news, platform updates, trend reports, award results, personnel moves, opinion pieces.
- "tactical_format": Short-form video (Shorts/Reels/TikTok), live stream, interactive format, social-first activation.

STEP 2 — Return JSON. The entire output must be concise and readable within 1-2 minutes.

COMMON FIELDS (always present):
{
  "content_type":       "<brand_campaign | industry_news | tactical_format>",
  "title":              "<Punchy, clear headline, max 120 chars. Language depends on source — see Critical rules below.>",
  "summary":            "<Executive summary: 2-3 factual sentences. Language depends on source — see Critical rules below.>",
  "brand":              "<Brand name>",
  "industry":           "<One of: Technology | Homeware | FMCG | Fashion | Automotive | Food & Beverage | Travel | Alcohol | Retail | Finance | Other>",
  "campaign_type":      ["<One or more of: Launch (new product or service introduction) | Awareness (brand-building, no direct sell) | OOH (outdoor, transit, or billboard placement) | Social (campaign designed for social media platforms) | Performance (direct response, conversion-driven) | Video (TVC, brand film, or cinematic video ad) | Influencer (creator or KOL partnership) | Branded Content (editorial or entertainment sponsored by a brand)>"],
  "region":             ["<One or more of: Global | Taiwan | Hong Kong | APAC | Japan | Korea | UK | US>"],
  "language":           "<Original source language: en, zh-TW, ja, or ko>",
  "title_zh":           null,
  "summary_zh":         null,
  "original_title":     "<If source is Japanese or Korean, the original title in that language. Otherwise null.>",
  "original_summary":   "<If source is Japanese or Korean, a 2-3 sentence summary in the original language. Otherwise null.>"
}

IF content_type = "brand_campaign", ALSO include:
{
  "brand_proposition":  "<The brand's overarching promise, value, or belief. One sentence. Language depends on source — see Critical rules.>",
  "key_message":        "<Core product selling point in one concise sentence. Language depends on source — see Critical rules.>",
  "target_audience":    "<Brief definition of demographics and psychographics. Language depends on source — see Critical rules.>",
  "consumer_insight":   "<The human truth or tension the campaign addresses. 1-2 sentences. Language depends on source — see Critical rules.>",
  "call_to_action":     "<The desired consumer behaviour. Language depends on source — see Critical rules.>"
}

IF content_type = "industry_news", ALSO include:
{
  "key_takeaway":          "<1-2 points highlighting the most critical facts or changes. Language depends on source — see Critical rules.>",
  "strategic_implication": "<Why this matters to the advertising industry or account planners. How it might affect future brand strategies or media planning. 1-2 sentences. Language depends on source — see Critical rules.>"
}

IF content_type = "tactical_format", ALSO include:
{
  "format_context":     "<Brief description: is this a short video challenge, live commerce stream, behind-the-scenes clip, etc. Language depends on source — see Critical rules.>",
  "the_hook":           "<How the content grabs attention in the first few seconds. Language depends on source — see Critical rules.>",
  "engagement_tactic":  "<Why the audience would watch, comment, or share (e.g., exclusive offers, influencer presence, humour). Language depends on source — see Critical rules.>",
  "conversion_path":    "<The immediate next step for the viewer (e.g., click link in bio, purchase during live, use a hashtag). Language depends on source — see Critical rules.>"
}

Critical rules:
- For English (en) sources: title, summary, and ALL type-specific breakdown fields in British English (colour, organisation, programme, etc.). title_zh and summary_zh are null. original_title and original_summary are null.
- For Chinese (zh-TW) sources: title, summary, and ALL type-specific breakdown fields in the original Traditional Chinese. Do NOT translate anything to English. title_zh and summary_zh are null. original_title and original_summary are null. Use Taiwan terminology (影片 not 視頻, 專案 not 項目, 軟體 not 軟件).
- For Japanese (ja) or Korean (ko) sources: title, summary, and ALL type-specific breakdown fields in Traditional Chinese (Taiwan). Do NOT translate anything to English. title_zh and summary_zh are null. original_title and original_summary MUST contain the original Japanese/Korean title and summary. Use Taiwan terminology (影片 not 視頻, 專案 not 項目, 軟體 not 軟件).

ANTI-HALLUCINATION RULES:
- You are analysing a thumbnail image and up to 4000 characters of text/transcript. If the text lacks dialogue or voiceover, DO NOT invent or assume any. Explicitly state '無對白 (No dialogue)'.
- For [tactical_format], if the content appears to be a teaser (預告片) focusing on mystery (e.g., a hidden product), do not invent visual details. Focus your analysis on how the mystery creates anticipation.
- If any specific field (like a clear call_to_action) is missing from the provided text and image, output none rather than guessing.

- Return ONLY valid JSON. No markdown fences, no explanation."""

_claude_client = None
_gemini_clients = []
_gemini_call_count = 0

_YT_ID_RE = re.compile(
    r'(?:youtube\.com/(?:watch\?.*v=|embed/|shorts/)|youtu\.be/)'
    r'([A-Za-z0-9_-]{11})'
)


def _extract_youtube_id(url: str):
    """Return the 11-char YouTube video ID or None."""
    m = _YT_ID_RE.search(url or "")
    return m.group(1) if m else None


def _fetch_thumbnail(video_id: str):
    """Fetch YouTube thumbnail bytes. Returns (bytes, mime_type) or None."""
    for quality in ("maxresdefault", "hqdefault"):
        try:
            resp = requests.get(
                f"https://img.youtube.com/vi/{video_id}/{quality}.jpg",
                timeout=5,
            )
            if resp.status_code == 200 and len(resp.content) > 1000:
                return (resp.content, "image/jpeg")
        except Exception:
            pass
    return None


def _get_claude_client():
    global _claude_client
    if _claude_client is None:
        import anthropic
        _claude_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _claude_client


def _get_gemini_clients():
    global _gemini_clients
    if not _gemini_clients:
        from google import genai
        keys = [os.environ.get("GEMINI_API_KEY"), os.environ.get("GEMINI_API_KEY_2"), os.environ.get("GEMINI_API_KEY_3"), os.environ.get("GEMINI_API_KEY_4")]
        _gemini_clients = [genai.Client(api_key=k) for k in keys if k]
    return _gemini_clients


def _call_claude(prompt):
    client = _get_claude_client()
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text


def _call_gemini(prompt, image_data=None):
    from google.genai import types

    global _gemini_call_count
    clients = _get_gemini_clients()
    start_idx = _gemini_call_count % len(clients)
    _gemini_call_count += 1

    # Build contents: text-only or multimodal
    if image_data:
        img_bytes, mime = image_data
        contents = [
            types.Part.from_text(text=SYSTEM + "\n\n" + prompt),
            types.Part.from_bytes(data=img_bytes, mime_type=mime),
        ]
    else:
        contents = SYSTEM + "\n\n" + prompt

    for i in range(len(clients)):
        client = clients[(start_idx + i) % len(clients)]
        try:
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
            )
            return resp.text
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"    ↻ Key {(start_idx + i) % len(clients) + 1} rate limited, trying next...")
                continue
            raise
    raise Exception("All Gemini API keys exhausted (rate limited)")


def tag_and_summarise(item: dict):
    """
    item must have: url, raw_text, source_name, published_at, tier
    Returns enriched dict ready for Firestore, or None on failure.
    """
    try:
        prompt = f"""Source: {item['source_name']}
URL: {item['url']}

---
{item['raw_text'][:4000]}
---

Return the JSON object."""

        # For YouTube URLs, fetch the thumbnail for multimodal analysis
        image_data = None
        yt_id = _extract_youtube_id(item['url'])
        if yt_id:
            image_data = _fetch_thumbnail(yt_id)
            if image_data:
                print(f"    📷 Thumbnail attached for YouTube video {yt_id}")

        # Gemini only (keys rotate automatically)
        raw = _call_gemini(prompt, image_data=image_data)

        # Strip markdown code fences if present
        cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
        cleaned = re.sub(r"\s*```$", "", cleaned)
        data = json.loads(cleaned)

        # Override industry from known brand map
        brand_lower = data.get("brand", "").lower()
        known = BRAND_INDUSTRY_MAP.get(brand_lower)
        if known:
            data["industry"] = known

        # Deterministic tag injection based on content_type
        ct = data.get("content_type", "brand_campaign")
        tags = list(data.get("campaign_type", []))

        if ct == "brand_campaign":
            if "CF" not in tags:
                tags.append("CF")
        elif ct == "tactical_format":
            if "Social" not in tags:
                tags.append("Social")
        # industry_news: AI already assigns 'Video' when branded video detected

        data["campaign_type"] = tags

        return {
            "content_type":          data.get("content_type", "brand_campaign"),
            "title":                 data.get("title"),
            "title_zh":              data.get("title_zh"),
            "summary":               data.get("summary"),
            "summary_zh":            data.get("summary_zh"),
            "brand":                 data.get("brand"),
            "industry":              data.get("industry"),
            "campaign_type":         data.get("campaign_type", []),
            "region":                data.get("region", []),
            "language":              data.get("language", "en"),
            # Brand Campaign fields
            "brand_proposition":     data.get("brand_proposition"),
            "key_message":           data.get("key_message"),
            "target_audience":       data.get("target_audience"),
            "consumer_insight":      data.get("consumer_insight"),
            "call_to_action":        data.get("call_to_action"),
            # Industry News fields
            "key_takeaway":          data.get("key_takeaway"),
            "strategic_implication": data.get("strategic_implication"),
            # Tactical Format fields
            "format_context":        data.get("format_context"),
            "the_hook":              data.get("the_hook"),
            "engagement_tactic":     data.get("engagement_tactic"),
            "conversion_path":       data.get("conversion_path"),
            "original_title":        data.get("original_title"),
            "original_summary":      data.get("original_summary"),
            "source_url":       item["url"],
            "source_name":      item["source_name"],
            "published_at":     item["published_at"],
            "category":         item.get("category"),
            "ai_tagged":        True,
        }
    except Exception as e:
        print(f"  ✗ AI tagging error for {item.get('url')}: {e}")
        return None
