"""
seed.py — Inject mock campaigns into Firestore for UI testing.
Run once: python seed.py

Delete test data from Firestore Console once the real pipeline is running.
"""
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate(os.environ['FIREBASE_SERVICE_ACCOUNT_PATH'])
firebase_admin.initialize_app(cred)
db = firestore.client()

now = datetime.now(timezone.utc)

MOCK = [
    {
        'brand':         'Uni-President',
        'title':         'Uni-President launches "A Cool Sip in the City" summer beverage campaign',
        'title_zh':      '統一「城市裡的一口清涼」——全新夏季飲品廣告於全台上線',
        'summary':       'Uni-President\'s latest summer campaign targets urban fatigue with a fresh brand message across TV, MRT lightboxes, and social platforms in Taipei, Taichung, and Kaohsiung.',
        'summary_zh':    '統一企業最新夏季廣告以都市人的午後疲憊為出發點，透過情境式影像傳遞「一口清涼、重新出發」的品牌訊息。本次活動橫跨電視、捷運燈箱及社群平台，並於台北、台中、高雄三地同步展開戶外廣告投放。',
        'industry':      'FMCG',
        'campaign_type': ['Launch', 'OOH', 'Video'],
        'region':        ['Taiwan'],
        'source_name':   'Brain Magazine',
        'source_url':    'https://www.brain.com.tw',
        'language':      'zh-TW',
        'ai_tagged':     True,
        'published_at':  now - timedelta(hours=2),
    },
    {
        'brand':         'Apple',
        'title':         '"Shot on iPhone 16" — Macro World campaign launches globally across OOH and YouTube',
        'title_zh':      None,
        'summary':       'Apple\'s latest UGC-led push showcases extreme macro photography from everyday users. The campaign spans YouTube pre-rolls, OOH in 12 cities, and a dedicated microsite with creator submissions.',
        'summary_zh':    None,
        'industry':      'Technology',
        'campaign_type': ['Launch', 'Video', 'OOH'],
        'region':        ['Global'],
        'source_name':   'Campaign Magazine',
        'source_url':    'https://www.campaignlive.co.uk',
        'language':      'en',
        'ai_tagged':     True,
        'published_at':  now - timedelta(hours=4),
    },
    {
        'brand':         'Nike',
        'title':         '"Winning Isn\'t Comfortable" — new performance brand film anchored on female athletes',
        'title_zh':      None,
        'summary':       '90-second anthem spot directed by Melina Matsoukas, anchored around elite female athletes. Heavy paid placement on Instagram Reels and YouTube ahead of the Paris marathon season.',
        'summary_zh':    None,
        'industry':      'Fashion',
        'campaign_type': ['Awareness', 'Video'],
        'region':        ['US'],
        'source_name':   'AdWeek',
        'source_url':    'https://www.adweek.com',
        'language':      'en',
        'ai_tagged':     True,
        'published_at':  now - timedelta(hours=6),
    },
    {
        'brand':         'Google',
        'title':         'Workspace "Do More With Less" — B2B push targets SMBs across LinkedIn and CTV',
        'title_zh':      None,
        'summary':       'Performance-led campaign emphasising AI features in Docs and Meet. Decision-makers at sub-500 employee companies are the primary target. Estimated $40M media spend.',
        'summary_zh':    None,
        'industry':      'Technology',
        'campaign_type': ['Performance', 'Social'],
        'region':        ['Global'],
        'source_name':   'AdAge',
        'source_url':    'https://adage.com',
        'language':      'en',
        'ai_tagged':     True,
        'published_at':  now - timedelta(days=1, hours=2),
    },
]

for item in MOCK:
    import hashlib
    doc_id = hashlib.md5(item['source_url'].encode()).hexdigest() + f"_{item['brand'].lower().replace(' ', '_')}"
    db.collection('campaigns').document(doc_id).set(item)
    print(f"✓ Seeded: {item['brand']} — {item['title'][:60]}")

print("\n✅ Done. Check Firestore Console → campaigns collection.")
