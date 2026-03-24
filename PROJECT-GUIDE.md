# AdPrism Project Guide

## Overview
AdPrism is a two-part system: a **React frontend** that displays advertising campaigns, and a **Python ingestion pipeline** that fetches, AI-tags, and stores campaigns from 170+ sources.

---

## Frontend (`adprism/adprism/src/`)

### App Shell
| File | What it does |
|------|-------------|
| `main.jsx` | Entry point — mounts the React app |
| `App.jsx` | Main shell — manages 5 views (Feed, Saved, Videos, Categories, Brand), wires up all hooks and components |

### Components (`src/components/`)
| File | What it does |
|------|-------------|
| `Sidebar.jsx` | Left nav panel — logo, view tabs, filter chips (industry/campaign type/region), stats counters. Slides in as a drawer on mobile |
| `Topbar.jsx` | Search bar + sort pills (All, Industry, Brands, Media). On desktop: buttons left, search right. On mobile: hamburger + search |
| `Feed.jsx` | Scrollable campaign list with date-grouped headers and infinite scroll via IntersectionObserver |
| `CampaignCard.jsx` | Individual campaign card — shows title, summary, tags, expandable "Strategic Breakdown" section. Handles 3 content types (brand_campaign, industry_news, tactical_format). Supports CJK text with proper fonts. Footer uses flex layout: channel name (left, wraps on overflow) + "AI summary" pill (right, fixed width via `flexShrink: 0` / `whiteSpace: nowrap`) |
| `HeartSaveButton.jsx` | Heart icon with animated burst/particle effects on save |
| `StatBar.jsx` | Top stats banner — today's new campaigns, brands tracked, video ads, trending industry |
| `NotificationPrompt.jsx` | Push notification opt-in banner — requests FCM permission and saves token |

### Hooks (`src/hooks/`)
| File | What it does |
|------|-------------|
| `useCampaigns.js` | Fetches campaigns from Firestore with real-time updates (`onSnapshot`), applies filters, handles pagination (10 per page). Also exports `useGlobalStats` for unfiltered aggregate counts |
| `useFilters.js` | Manages all filter state — industries, campaign types, regions, dates, sort mode, search text. Provides toggle/clear/reset functions |
| `useSaved.js` | Real-time subscription to saved campaigns. Optimistic UI updates on save/unsave |

### Styles (`src/styles/`)
| File | What it does |
|------|-------------|
| `tokens.css` | Design system — CSS custom properties for colours, typography, tag colours, glassmorphism, shadows. Has dark mode support |
| `global.css` | Resets, font imports (DM Sans, Noto Sans/Serif for CJK), glass effects, responsive breakpoints (768px), scrollbar styling |

### Firebase (`src/lib/`)
| File | What it does |
|------|-------------|
| `firebase.js` | Initialises Firebase app, Firestore, and Cloud Messaging. Handles device fingerprinting, FCM token saving, notification permissions, and foreground message listener |

### Config
| File | What it does |
|------|-------------|
| `vite.config.js` | Vite setup — base path `/adprism/`, React plugin |
| `firebase.json` | Hosting config — serves from `dist/`, SPA rewrites |
| `firestore.rules` | Security rules — campaigns readable by all, only `saved`/`dismissed` fields writable; FCM tokens write-only |

---

## Ingestion Pipeline (`adprism/adprism-ingest/src/`)

### Entry Point
| File | What it does |
|------|-------------|
| `main.py` | Orchestrator — fetches sources → deduplicates → AI processes → saves to Firestore → sends FCM notifications → cleans up old campaigns. CLI flags: `--recent` (40min), `--backfill` (12hr), `--hours N`, `--source <name>` (filter by brand), `--no-dedup` |

### Source Fetchers (`src/sources/`)
| File | What it does |
|------|-------------|
| `youtube.py` | Fetches YouTube channel RSS feeds (Atom). Handles both `UC...` channel IDs and `@handle` resolution. Returns 15 most recent videos per channel |
| `rss.py` | Generic RSS feed fetcher. Uses `trafilatura` to extract full article text from links. Falls back to feed summary if extraction fails |

### Processing (`src/processing/`)
| File | What it does |
|------|-------------|
| `claude.py` | **AI tagging engine** — sends text (+ YouTube thumbnail for video URLs) to Gemini 2.5 Flash. Classifies each item as `brand_campaign`, `industry_news`, or `tactical_format` and returns structured JSON with breakdowns. Rotates across 4 Gemini API keys. Has anti-hallucination rules for visual-heavy content |
| `dedup.py` | SQLite-based URL deduplication — stores MD5 hashes of seen URLs in `seen.db` |
| `prioritise.py` | Sorts items by `published_at` descending (newest first) |

### Database (`src/db/`)
| File | What it does |
|------|-------------|
| `firestore.py` | Saves campaigns to Firestore using MD5(url) as doc ID (natural dedup). Has cleanup for campaigns >3 years old (unless saved). Migration helpers for legacy data |

### Notifications (`src/notify/`)
| File | What it does |
|------|-------------|
| `fcm.py` | Sends FCM push notifications — reads device tokens from Firestore, formats notification with campaign titles, marks campaigns as `is_pushed`. Two-tier duplicate prevention (Firestore flag + FCM collapse key) |

### Config
| File | What it does |
|------|-------------|
| `config.py` | Defines all 170+ sources across 5 categories: CAT1 (global brands), CAT2 (client/industry), CAT3 (local brands), CAT4 (ad media RSS), CAT5 (production houses). Also contains `BRAND_INDUSTRY_MAP` (150+ brand→industry mappings) |
| `seed.py` | Injects 4 mock campaigns for UI testing |
| `requirements.txt` | Python deps: anthropic, firebase-admin, feedparser, trafilatura, requests, google-genai, etc. |

---

## Data Flow

```
170+ Sources (YouTube + RSS)
        ↓
   main.py fetches
        ↓
   dedup.py filters seen URLs
        ↓
   claude.py AI-tags (Gemini + thumbnail)
        ↓
   firestore.py saves to Firestore
        ↓
   fcm.py sends push notifications
        ↓
   React frontend (real-time onSnapshot)
        ↓
   User sees campaigns in Feed
```

---

## GitHub Repository Secrets

All secrets are stored in **GitHub Settings → Secrets and variables → Actions**. They are injected at runtime in CI/CD — no local `.env` file is needed.

### Backend (Ingestion Pipeline)
| Secret | Purpose |
|--------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON — used by `firestore.py` and `fcm.py` for Firestore writes and push notifications |
| `GEMINI_API_KEY` | Primary Gemini API key — used by `claude.py` for AI tagging |
| `GEMINI_API_KEY_2` | Gemini API key #2 — rotated via key pool in `claude.py` |
| `GEMINI_API_KEY_3` | Gemini API key #3 — rotated via key pool in `claude.py` |
| `GEMINI_API_KEY_4` | Gemini API key #4 — rotated via key pool in `claude.py` |

### Frontend (React / Firebase Hosting)
| Secret | Purpose |
|--------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID — used for push notifications |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_VAPID_KEY` | VAPID key — used for web push subscription in `firebase.js` |

---

## GitHub Actions Workflows (`.github/workflows/`)

| File | What it does |
|------|-------------|
| `ingest.yml` | **Scheduled ingest** — triggered by cron-job.org via `workflow_dispatch`. Runs `main.py --recent` (last 40 min window) to pick up new content |
| `test-ingest.yml` | **Test Ingest (one-off)** — manual `workflow_dispatch` with inputs: `source` (brand name filter) and `hours` (6/24/72/168/336). For testing a single source |
| `full-ingest.yml` | **Full Ingest (all sources, manual)** — manual `workflow_dispatch` with input: `hours` (6/12/24/72/168/336/720/1440). Runs all sources with a custom lookback window (max ~2 months). Dedup skipped |
| `deploy.yml` | Frontend deployment workflow |

---

## Key Things to Know When Requesting Changes

- **To change how campaigns look**: edit `CampaignCard.jsx` (card layout, tags, breakdowns) or `tokens.css` (colours, design tokens)
- **To change filters or sorting**: edit `useFilters.js` (state), `Sidebar.jsx` (filter UI), `useCampaigns.js` (Firestore queries)
- **To change the AI output/classification**: edit the `SYSTEM` prompt and field mappings in `claude.py`
- **To add/remove tracked sources**: edit `config.py` (YouTube channels or RSS feeds)
- **To change notification behaviour**: edit `fcm.py` (backend) or `NotificationPrompt.jsx` (frontend)
- **To change layout/responsiveness**: edit `global.css` (breakpoints, flex rules) or component inline styles
- **To change the top stats bar**: edit `StatBar.jsx`
- **To change navigation/views**: edit `Sidebar.jsx` (nav items) and `App.jsx` (view routing)
