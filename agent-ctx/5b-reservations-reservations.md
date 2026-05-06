# Phase 5B — Reservations with Google Calendar

## Task
Create 11 files for the reservations feature of QAIROSS SaaS platform.

## Files Created (All 11 ✓)

### API Routes (7 files)

1. **`src/app/api/sites/[id]/reservations/config/route.ts`** (199 lines)
   - GET: Fetch reservation config (creates default if not exists), parses JSON fields
   - PUT: Update config with full validation (reservationType, slotDuration, capacity, advance times), handles availableDays/timeSlots as JSON strings, handles Google Calendar fields
   - Auth + ownership verification on both methods

2. **`src/app/api/sites/[id]/reservations/route.ts`** (309 lines)
   - GET: List reservations with date/status filters, pagination
   - POST: Create reservation with full validation:
     - Config exists and isEnabled check
     - minAdvanceHours / maxAdvanceDays boundary validation
     - Day of week availability check
     - TimeSlot existence check against config
     - Capacity check (existing approved/pending reservations + partySize vs maxCapacityPerSlot)
     - Auto-approve logic
     - Google Calendar event creation (best effort, non-blocking)
     - Token refresh handling for Google Calendar
   - Auth + ownership verification

3. **`src/app/api/reservations/[id]/status/route.ts`** (103 lines)
   - PUT: Update reservation status (approved/cancelled/completed/no_show)
   - Ownership verification (site owner OR super_admin)
   - Google Calendar event deletion when cancelling approved reservation (best effort)

4. **`src/app/api/google-calendar/connect/route.ts`** (77 lines)
   - GET: Generate Google OAuth URL with calendar.readonly + calendar.events scopes
   - CSRF protection via state cookie (siteId:randomUUID format)
   - Auth + ownership verification

5. **`src/app/api/google-calendar/callback/route.ts`** (90 lines)
   - GET: Exchange authorization code for tokens
   - CSRF state verification from cookie
   - Fetches primary calendar ID
   - Stores tokens in ReservationConfig
   - Redirects to editor page with success indicator

6. **`src/app/api/google-calendar/disconnect/route.ts`** (61 lines)
   - PUT: Clears all Google Calendar fields (tokens, calendarId, connected flag)
   - Auth + ownership verification

7. **`src/app/api/admin/reservations/route.ts`** (135 lines)
   - GET: List all reservations across platform with site info, pagination, search (by business/customer name), status filter. Super admin only.
   - PUT: Update reservation status (admin override) with activity log. Super admin only.

### Client Components (3 files)

8. **`src/components/editor/tab-reservations.tsx`** (624 lines)
   - Two main cards: "Configuración" and "Google Calendar"
   - Config section: enable/disable switch, reservation type select (6 types), custom label, slot duration, max capacity, advance settings, auto-approve, confirmation message, day-of-week toggles, time slot CRUD
   - Google Calendar: connection status indicator, connect/disconnect buttons, calendar ID display
   - Debounced auto-save (800ms) on all changes
   - Follows existing editor tab patterns (shadcn/ui components, Lucide icons)

9. **`src/app/(admin)/admin/reservations/page.tsx`** (593 lines)
   - Professional admin page at /admin/reservations
   - Table with: Negocio, Cliente, Fecha, Hora, Estado, Tipo, Personas, Acciones
   - Search by business or customer name
   - Status filter badges with color coding and icons
   - Expandable rows with quick action buttons (Approve, Cancel, Complete, No-show)
   - Detail modal with full reservation info
   - Pagination controls
   - Activity logging for admin actions

10. **`src/components/minisite/reservation-section.tsx`** (530 lines)
    - Public booking form for customers
    - Calendar date picker (filtered by available days, min/max range)
    - Time slot selector with live capacity display
    - Party size selector with ±buttons
    - Customer info form (name, email, phone, WhatsApp checkbox, notes)
    - All hooks called unconditionally (no conditional return before hooks)
    - Framer Motion animations for step reveal
    - WhatsApp integration after booking
    - Success state with confirmation message
    - Styled with accentColor, textColor, cardColor props

### Library (1 file)

11. **`src/lib/google-calendar.ts`** (447 lines)
    - Manual OAuth approach using fetch to Google's token endpoints
    - `refreshAccessToken()`: Refresh expired tokens
    - `getValidAccessToken()`: Get valid token with auto-refresh
    - `getPrimaryCalendar()`: Fetch primary calendar ID
    - `createEvent()`: Create Calendar event (simple version)
    - `createEventExtended()`: Create event with token update info returned
    - `updateEvent()`: Update existing event
    - `deleteEvent()`: Delete event (204 response handling)
    - `getGoogleAuthUrl()`: Generate OAuth authorization URL
    - `exchangeCodeForTokens()`: Exchange code for access/refresh tokens
    - All Calendar operations return null on failure (never throw)
    - Token refresh info propagated back for DB update

## Lint Status
All 11 new files pass ESLint with zero errors. Only pre-existing errors in other files remain.
