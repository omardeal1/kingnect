# Task: fix-security-backend — Security & Backend Fixes

## Agent: Security & Backend Fix Agent
## Task ID: fix-security-backend

---

### FIX 1: Upload route — MIME type validation
**File:** `src/app/api/upload/route.ts`
- Added MIME type validation: must start with `image/` and be in allowed set (jpeg, png, gif, webp)
- Added file extension validation: only `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Explicit SVG block (XSS risk) for both `.svg` extension and `image/svg+xml` MIME
- Kept 2MB max size limit
- Added `validateImageUpload()` call from `@/lib/security` as additional check

**Also updated:** `src/lib/security.ts`
- Removed `image/svg+xml` from `ALLOWED_IMAGE_TYPES` Set
- Updated error message to exclude SVG from allowed types
- Updated `SECURITY.ALLOWED_IMAGE_TYPES` constant

### FIX 2: Rate limiting on orders and register
**File:** `src/app/api/orders/route.ts`
- Imported `rateLimitOrders` from `@/lib/rate-limit`
- Added IP-based rate limit at top of POST handler (5 requests/minute)
- Returns 429 with Spanish error message

**File:** `src/app/api/auth/register/route.ts`
- Imported `rateLimitRegister` from `@/lib/rate-limit`
- Added IP-based rate limit at top of POST handler (3 requests/hour)
- Returns 429 with Spanish error message

### FIX 3: Register route plan slug
**File:** `src/app/api/auth/register/route.ts`
- Changed `where: { slug: "free" }` → `where: { slug: "trial" }`
- Removed duplicate plan creation (was creating a "free" plan if not found)
- Added fallback: tries to find any active plan with price=0
- Throws descriptive error if no plan found at all

### FIX 4: Fix getCurrentUser function
**File:** `src/lib/auth.ts`
- Simplified `getCurrentUser()` to use clean `getServerSession(authOptions)` pattern
- Added `emailVerified` to the select fields
- Removed redundant handler exports: `const handler = NextAuth(...)`, `export const auth`, `export const GET`, `export const POST`
- Removed `export { signIn, signOut } from "next-auth/react"` (client components import directly from `next-auth/react`)
- Kept: `authOptions`, `getCurrentUser`, `hashPassword`, `verifyPassword`, type declarations

### FIX 5: Input validation on sites PUT route
**File:** `src/app/api/sites/[id]/route.ts`
- Added `validateSlug` and `validateHexColor` imports from `@/lib/security`
- Validate `businessName` is non-empty string if provided
- Validate slug format (alphanumeric + hyphens) using `validateSlug()` if provided
- Check slug uniqueness if being changed (returns 409 if taken by another site)
- Validate all color fields (`backgroundColor`, `cardColor`, `textColor`, `accentColor`) as valid hex using `validateHexColor()`
- Validate `themeMode` (light/dark/both) and `backgroundType` (color/gradient/image)
- Trim all string inputs before saving

### FIX 6: Validate order total server-side
**File:** `src/app/api/orders/route.ts`
- Calculate `calculatedTotal` from items using `items.reduce()` instead of trusting client-provided `total`
- Each item's `total` is also calculated as `unitPrice * quantity` server-side
- Removed `total` from destructured body (no longer used)

### FIX 7: Remove Prisma query logging in production
**File:** `src/lib/db.ts`
- Changed `log: ['query']` → `log: process.env.NODE_ENV === 'development' ? ['query'] : ['error']`
- Queries only logged in development; only errors logged in production

### FIX 8: Create test user with seed script
**File:** `prisma/seed.ts`
- Added demo client user: `demo@qaiross.app` / `Demo123!`, role: client
- Created Client record: businessName "Restaurante El Sabor"
- Created Trial subscription
- Created MiniSite with slug `restaurante-el-sabor`, isPublished: true
- Added 3 social links (Facebook, Instagram, WhatsApp)
- Added 2 contact buttons (WhatsApp, Llamar)
- Added 1 location: "Sucursal Centro"
- Added 2 menu categories: "Entradas" (2 items) and "Platos Fuertes" (2 items)
- Added 2 gallery images (placeholders)
- Added 2 testimonials
- All using idempotent upsert patterns
- Seed executed successfully

---

## Verification
- `bun run lint` — 0 errors (3 pre-existing warnings unrelated to changes)
- Dev server running without errors
- No broken imports from auth.ts changes (all consumers use `authOptions` or `hashPassword`)
- `signIn`/`signOut` used from `next-auth/react` directly in client components (not from auth.ts)
