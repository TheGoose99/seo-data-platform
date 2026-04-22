@AGENTS.md
@README.md

## Working notes (internal)

- **Current state**: onboarding intake is debug-only (JSON output + validation). No persistence/pipeline yet.
- **Next milestone**: wire intake submission into Supabase (`onboarding_intakes`) + run pipeline steps (DataForSEO → Claude → GitHub/Vercel).
- **Key files**:
  - `components/onboarding/psychologist-intake-form.tsx`
  - `lib/validation/onboarding-intake.ts`
  - `app/api/onboarding/intake/validate/route.ts`
  - `supabase/migrations/0009_onboarding_intakes_pipeline.sql`
