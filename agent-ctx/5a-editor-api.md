# Task 5a-editor-api: Mini Web Editor API Routes

**Date**: 2025-07-14
**Agent**: editor-api

## Summary

Created all API routes for the mini web editor, including a shared helper module and a file upload endpoint. All routes use authentication checks and site ownership verification.

## Files Created

1. **`/src/lib/api-helpers.ts`** — Shared helper functions
   - `getAuthenticatedUser()` — Returns session user or null
   - `verifySiteOwnership(userId, siteId)` — Checks user owns the site (super_admin bypasses)
   - `errorResponse(message, status)` — Returns JSON error response
   - `successResponse(data, status)` — Returns JSON success response

2. **`/src/app/api/upload/route.ts`** — File upload (POST)
   - Accepts FormData with `file` field
   - Validates: images only (jpg, png, gif, webp, svg), max 2MB
   - Saves to `/public/uploads/` with UUID filename
   - Returns `{ url: "/uploads/filename" }`

3. **`/src/app/api/sites/[id]/social-links/route.ts`** — Social links CRUD
   - GET: list all, ordered by sortOrder
   - POST: create (type, label, url, enabled, sortOrder)
   - PUT: update by id
   - DELETE: delete by id

4. **`/src/app/api/sites/[id]/contact-buttons/route.ts`** — Contact buttons CRUD
   - GET/POST/PUT/DELETE with same pattern

5. **`/src/app/api/sites/[id]/locations/route.ts`** — Locations CRUD
   - GET/POST/PUT/DELETE with same pattern

6. **`/src/app/api/sites/[id]/slides/route.ts`** — Slides CRUD
   - GET/POST/PUT/DELETE with same pattern

7. **`/src/app/api/sites/[id]/menu/route.ts`** — Menu categories + items CRUD
   - GET: categories with nested items
   - POST/PUT/DELETE: uses `type: "category" | "item"` to distinguish
   - Category: name, enabled, sortOrder
   - Item: categoryId, name, description, price, imageUrl, isOrderable, enabled, sortOrder

8. **`/src/app/api/sites/[id]/gallery/route.ts`** — Gallery images CRUD
   - GET/POST/PUT/DELETE with same pattern

9. **`/src/app/api/sites/[id]/services/route.ts`** — Services CRUD
   - GET/POST/PUT/DELETE with same pattern

10. **`/src/app/api/sites/[id]/testimonials/route.ts`** — Testimonials CRUD
    - GET/POST/PUT/DELETE with same pattern

11. **`/src/app/api/sites/[id]/custom-links/route.ts`** — Custom links CRUD
    - GET/POST/PUT/DELETE with same pattern

12. **`/public/uploads/`** — Directory created for uploaded files

## Patterns Used

- All routes use `getAuthenticatedUser()` for auth (401 if not authenticated)
- All site routes use `verifySiteOwnership()` (403 if not owner)
- PUT/DELETE verify the record belongs to the site (404 if not found or mismatch)
- Error messages in Spanish
- Consistent response format: `{ socialLinks: [...] }`, `{ socialLink: {...} }`, `{ deleted: true }`
- Selective field updates via spread with undefined checks
- Try/catch with console.error and 500 fallback

## Lint Status
✅ `bun run lint` passes with no errors
