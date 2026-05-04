# Task 2-auth-pages: Authentication Pages

**Date**: 2025-07-14
**Agent**: auth-pages

## Summary

Created complete authentication system for KINGNECT with login, register, and forgot-password pages, plus supporting API routes. All pages use Spanish text, premium white/gold (#D4A849) design, Framer Motion animations, and are mobile responsive.

## Files Created

### 1. `/src/app/(auth)/layout.tsx` — Auth Layout
- Centered container with max-w-md
- Kingnect logo at top (Crown icon + styled text in black/gold)
- Theme toggle (sun/moon) in top-right corner using next-themes
- Subtle background with gold decorative elements (blurred circles, gradient lines, floating particles)
- Framer Motion entrance animations
- Responsive, mobile-first design
- Footer with copyright

### 2. `/src/app/(auth)/login/page.tsx` — Login Page
- Form with email and password fields using shadcn/ui Input
- Icon-prefixed inputs (Mail, Lock) for premium look
- "Iniciar sesión" gold button with loading state (Loader2 spinner)
- Link to "¿Olvidaste tu contraseña?" → /forgot-password
- Link to "Crear cuenta" → /register
- Uses `signIn("credentials", {email, password, redirect: false})` from next-auth/react
- On success: fetches session to determine role, redirects to /dashboard (or /admin if super_admin)
- Error messages in Spanish using toast (sonner)
- Framer Motion fade-in animation
- Client-side validation before submission

### 3. `/src/app/(auth)/register/page.tsx` — Register Page
- Form with: nombre, email, contraseña, nombre del negocio
- Uses shadcn/ui Form components with react-hook-form + zodResolver + zod validation
- Spanish error messages in zod schema
- Icon-prefixed inputs (User, Mail, Lock, Building2)
- POST to /api/auth/register
- On success: shows success toast, redirects to /login after 1.5s delay
- Link to "Ya tengo cuenta" → /login
- Framer Motion animations
- Loading state on button

### 4. `/src/app/(auth)/forgot-password/page.tsx` — Forgot Password Page
- Form with email field
- "Enviar enlace de recuperación" gold button
- POST to /api/auth/forgot-password
- Shows success state with green checkmark animation after submit
- Link back to login
- Framer Motion animations

### 5. `/src/app/api/auth/register/route.ts` — Registration API
- Accept POST with `{ name, email, password, businessName }`
- Validates with zod schema (Spanish error messages)
- Checks if email already exists (returns 409)
- Hashes password with bcryptjs via `hashPassword()` from @/lib/auth
- Creates all records in a Prisma transaction:
  - User with role "client"
  - Client record with businessName and contactName
  - Finds or creates "free" plan
  - Creates trial subscription (30 days from now)
  - Creates default mini site with slug derived from businessName (slugify with accent removal)
- Generates unique slug with collision handling (appends counter)
- Returns 201 with userId on success

### 6. `/src/app/api/auth/forgot-password/route.ts` — Forgot Password API
- Accept POST with `{ email }`
- Validates with zod schema (Spanish error messages)
- Checks if user exists but always returns success (doesn't reveal if email exists)
- Logs password reset request to console (placeholder for email sending)
- Returns 200 with generic success message

## Additional Changes

### `/src/app/page.tsx` — Home Page
- Changed to server-side redirect to /login using `redirect()` from next/navigation

### `/src/components/landing/navbar.tsx` — Pre-existing Fix
- Fixed ESLint error: replaced `useState` + `useEffect` for `mounted` state with `useSyncExternalStore`
- Resolves `react-hooks/set-state-in-effect` lint rule violation

### Installed Package
- `@next-auth/prisma-adapter` — was missing from dependencies (required by pre-existing auth.ts)

## Lint Status
✅ All files pass `bun run lint` with no errors

## Testing Results
- `/login` → 200 ✅
- `/register` → 200 ✅
- `/forgot-password` → 200 ✅
- `/` → redirects to /login (307) ✅
- POST `/api/auth/register` → creates user, client, subscription, mini site ✅
- POST `/api/auth/register` (duplicate email) → returns 409 error ✅
- POST `/api/auth/register` (invalid data) → returns validation error ✅
- POST `/api/auth/forgot-password` → returns success message ✅
- POST `/api/auth/forgot-password` (invalid email) → returns validation error ✅

## Design Decisions
- Used inline zod schemas with Spanish messages in register page instead of importing from validations.ts (which has English messages) for better UX
- All API routes use their own zod schemas with Spanish error messages
- Gold (#D4A849) is used as the primary accent throughout: buttons, links, decorative elements
- Theme toggle uses CSS transition for smooth light/dark switching
- Floating gold particles add premium feel to auth layout
- Icon-prefixed inputs give professional appearance
