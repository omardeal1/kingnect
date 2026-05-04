# Task 6 — Monitoring & Logging Agent

## Task
Implement monitoring and logging for production

## Files Created
1. `/src/app/api/health/route.ts` — Public health check API endpoint
2. `/src/lib/logger.ts` — Structured logger (dev: formatted, prod: JSON)
3. `/src/lib/sentry.ts` — Sentry server configuration
4. `/src/lib/sentry-client.ts` — Sentry browser/client configuration
5. `/src/app/global-error.tsx` — Global error boundary with Sentry integration

## Files Updated
1. `/.env` — Added NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT

## Key Decisions
- Health endpoint returns 503 only if DB is down (critical dependency); other services report "not_configured" but don't cause 503
- Sentry initializes only when NEXT_PUBLIC_SENTRY_DSN is non-empty (graceful no-op in dev)
- Logger uses ANSI colors in dev, JSON in prod for log aggregation
- Global error boundary uses full HTML wrapper (required by Next.js convention)
- Sentry client has replaysSessionSampleRate=0 to save bandwidth; replaysOnErrorSampleRate=1.0 to always capture errors

## Verification
- Health endpoint tested: `curl /api/health` returns 200 with all service statuses
- Lint: 0 errors (3 pre-existing warnings only)
- Dev server: compiles and runs without errors
