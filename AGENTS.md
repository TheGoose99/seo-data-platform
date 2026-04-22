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
<!-- END:nextjs-agent-rules -->
