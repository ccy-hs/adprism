[CLAUDE.md](https://github.com/user-attachments/files/26167177/CLAUDE.md)
# CLAUDE.md

## Critical Rules

- **ALWAYS read the current file before discussing, quoting, or modifying any code.** Never rely on memory or assumptions about file contents — the code may have changed since you last saw it.
- **NEVER quote or reference code without first opening the file.** If asked "what does X look like?", read the file first, then answer.
- **After every edit, re-read the file to confirm the change was applied correctly.**
- **After any change that affects function or logic (adding/removing/renaming files, changing component behaviour, modifying data flow, altering hooks/config), update `PROJECT-GUIDE.md` to keep it accurate.** This is the user's reference document for understanding the codebase.

## Session Continuity

This project evolves across multiple sessions. At the start of each session:
1. Read this CLAUDE.md file.
2. Check the Decision Log below for recent context.
3. Do NOT assume you know the current state of any file — always verify.

## Decision Log

<!-- Append decisions, completed changes, and important context here so future sessions have continuity. Format: -->
<!-- - [YYYY-MM-DD] Brief description of what was changed and why -->
- [2026-03-22] Created `PROJECT-GUIDE.md` — a readable reference doc explaining every file in the project, data flow, and which files to edit for common changes. Must be kept up to date after logic/structural changes.
- [2026-03-23] Added GitHub Repository Secrets section to `PROJECT-GUIDE.md` — documents all 12 secrets (5 backend: FIREBASE_SERVICE_ACCOUNT, GEMINI_API_KEY ×4; 7 frontend: VITE_FIREBASE_* ×6 + VITE_FIREBASE_VAPID_KEY). Secrets are injected via CI/CD, no local `.env` needed.
- [2026-03-23] Fixed mobile card footer overlap in `CampaignCard.jsx` — AI summary pill now has `flexShrink: 0` + `whiteSpace: nowrap` to stay fixed-width pinned right; channel name gets `minWidth: 0` + `marginRight: 8` so it wraps instead of overlapping.


## Known Pitfalls

<!-- Add recurring mistakes here as you encounter them. Examples: -->
<!-- - Don't use deprecated API X; use Y instead -->
<!-- - Component Z lives in /src/features/, not /src/components/ -->
<!-- - Always run `npm test` before committing -->


## Project Structure

<!-- Fill in your project's key directories and their purposes -->
<!-- Example:
- /src/          — Application source code
- /src/features/ — Feature modules
- /src/lib/      — Shared utilities
- /tests/        — Test files
-->


## Conventions

<!-- Add your coding conventions as you establish them -->
<!-- Example:
- Use named exports, not default exports
- Error handling: always use try/catch with typed errors
- Naming: camelCase for functions, PascalCase for components
-->
