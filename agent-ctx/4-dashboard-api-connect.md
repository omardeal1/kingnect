# Task 4 — Connect Client Dashboard to Real API Data

## Work Done

### 1. Created Analytics API Route (`/api/analytics/route.ts`)
- GET handler requiring authentication (session check via getServerSession)
- Takes `siteId` as query parameter
- Verifies the site belongs to the authenticated user (client ownership or super_admin)
- Returns analytics for last 30 days:
  - `totalViews` — count of "view" events
  - `totalWhatsappClicks` — count of "click_whatsapp" events
  - `totalOrders` — count of orders in the period
  - `dailyBreakdown` — array of `{ date, views, clicks, orders }` for each of the 30 days
- Queries `AnalyticsEvent` and `Order` tables from the database

### 2. Updated Dashboard Home Page (`dashboard/page.tsx`)
- Removed `placeholderStats` and `placeholderOrders` mock data
- Added `useQuery` from TanStack React Query for `/api/analytics?siteId=...`
- Added `useQuery` for `/api/orders?siteId=...` (recent 5 orders)
- Added loading skeleton states for both stats and orders sections
- Gets `siteId` from `useDashboardStore`
- All existing UI layout preserved (welcome card, plan status, QAIROSS card, QR card, stats card, recent orders)

### 3. Updated Orders Page (`dashboard/orders/page.tsx`)
- Removed `placeholderOrders` mock data
- Added `useQuery` to fetch `/api/orders?siteId=...`
- `handleStatusChange` now calls `PUT /api/orders` with `{ orderId, status }` via `useMutation`
- After successful status change, invalidates the query to refresh data
- Shows loading skeleton while fetching orders
- Shows spinner on "Cambiar estado" button during mutation
- Disabled dropdown items during mutation to prevent double-clicks
- All existing UI preserved (filters, search, status badges, order items, WhatsApp button)

### 4. Updated Billing Page (`dashboard/billing/page.tsx`)
- "Gestionar suscripción" button now calls `POST /api/stripe/create-portal` with `{ clientId }` and redirects to returned URL
- "Cambiar plan" button now calls `POST /api/stripe/create-checkout` with `{ planId, clientId }` and redirects to returned URL
- "Reactivar ahora" button (shown when blocked) also calls `POST /api/stripe/create-portal`
- Added loading states (Loader2 spinner) for all Stripe-related buttons during API calls
- Graceful error handling with toast messages for:
  - Stripe not configured (503 with STRIPE_NOT_CONFIGURED code)
  - Network errors
  - General API errors
- Fetches plans from `/api/plans` to get database IDs for Stripe checkout
- Trial plan click shows info toast ("El plan Trial es gratuito")

### 5. Extended Dashboard Store (`dashboard-store.ts`)
- Added `clientId` field to `DashboardData` interface
- Added `planId` field to `DashboardData` interface
- Both needed for Stripe API integration

### 6. Updated Dashboard Layout (`(dashboard)/layout.tsx`)
- Now passes `clientId` (from `client.id`) and `planId` (from `client.subscription.plan.id`) to DashboardShell

## Files Changed
- NEW: `src/app/api/analytics/route.ts`
- MODIFIED: `src/app/(dashboard)/dashboard/page.tsx`
- MODIFIED: `src/app/(dashboard)/dashboard/orders/page.tsx`
- MODIFIED: `src/app/(dashboard)/dashboard/billing/page.tsx`
- MODIFIED: `src/lib/dashboard-store.ts`
- MODIFIED: `src/app/(dashboard)/layout.tsx`

## Lint Result
- 0 errors, 3 pre-existing warnings only
