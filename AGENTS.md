<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Repo-specific notes

- This app is on **Next.js 16** and uses the **`proxy.ts`** convention (do not reintroduce `middleware.ts`).
- Prefer the embedded Next docs at `node_modules/next/dist/docs/` when dealing with framework-level behavior.

### Internal onboarding (psychologist cabinets)

- **Entry point**: `/clients/new?org_id=<uuid>` renders the internal multi-step intake form (debug-only for now).
- **Payload schema**: `lib/validation/onboarding-intake.ts` (Zod). Treat it as the contract for the onboarding pipeline.
- **Server-side validation**: `POST /api/onboarding/intake/validate` (RBAC + masked secrets).
- **Operator UX**: the form includes an **“Operator advanced”** toggle; keep default mode minimal and derive values when possible.
- **Admin tools**: `/app/tools` is the internal operator page for running ingestion/jobs + onboarding utilities.

#### Hyper-local location intelligence

- **Source of truth**: `lib/romania/locations.ts` (`CITY_NEIGHBORHOODS_MAPPING`).
- The onboarding form derives **city / sector (București) / neighborhood** from Google Places + local anchors.
- Important: neighborhood matching must avoid substring collisions (e.g. `"Olteniței"` should not match `"Tei"`).

#### Keyword intelligence

- **Pipeline**: `lib/seo/keyword-intelligence.ts`
- **Maps SERP classifier**: `lib/providers/dataforseo/serp-maps.ts` (detects local-pack presence via DataForSEO Maps SERP).
- **Geo focus**: when intake has a known `sector`/`neighborhood`, pass `geoFocus` so keyword expansion doesn’t scatter across all București sectors/neighborhoods.

#### Cross-project Firebase ownership

- `seo-data-platform` is the source of truth for Firebase config and admin credentials.
- Expose Firebase config/verification only through internal token-protected routes under `/api/internal/firebase/*`.
- `closeby-demo-project` consumes these endpoints using `SEO_DATA_PLATFORM_URL` + shared internal token.
<!-- END:nextjs-agent-rules -->

## Revenue-First Operating Rules (User Mandate)

- Default to **Phase 1 (0-5 clients)** unless user explicitly switches phase.
- Always evaluate: **"Does this help generate revenue or validate quickly?"**
  - If yes: proceed fast.
  - If no: mark as **FUTURE**.
- Prioritize speed and execution over perfection.
- Keep solutions minimal: simple > scalable, manual > automated (early stage).
- Avoid early infra complexity (microservices, heavy DevOps, over-architecture).
- Prefer EU-first/GDPR-safe defaults for hosting/data when relevant.
- Optimize for psychologists as non-technical users: clarity and simplicity first.

### Response Style

- Keep responses concise.
- Default structure:
  1. Answer
  2. Brief reasoning
  3. Implementation

### Mode Contracts

- `PLAN`: no code; output goal, approach, max 7 steps, risks, decision.
- `EXECUTE`: implement directly; minimal theory.
- `REVIEW`: classify KEEP / MODIFY / DELAY with short reason.
- `DEBUG`: root cause + minimal fix.
- `JIRA`: tasks grouped by MVP / Scraping / Automation with HIGH / MEDIUM / LOW.
- `SCRAPER`: prefer Node.js scripts; include structure, extraction logic, CSV/JSON export.
