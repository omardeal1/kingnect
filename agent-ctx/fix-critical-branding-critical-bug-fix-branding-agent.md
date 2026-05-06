# Task: fix-critical-branding

## Agent: Critical Bug Fix & Branding Agent

## Summary
Fixed 10 critical bugs and performed full "mini web" → "QAIROSS" branding update across the entire QAIROSS codebase.

## Bug Fixes Applied

| # | Fix | File(s) | Severity |
|---|-----|---------|----------|
| 1 | Broken React import (`{ React }` → `* as React`) | sites/[id]/edit/page.tsx | CRITICAL |
| 2 | Hydration mismatch from Math.random() → deterministic pattern | hero.tsx | CRITICAL |
| 3 | DOM memory leak (tempDiv appendChild + unused canvasRef/QRCodeCanvas) | qr-display.tsx | CRITICAL |
| 4 | Missing safe-area-bottom CSS | globals.css | MEDIUM |
| 5 | Missing error/not-found boundaries | error.tsx, [slug]/not-found.tsx | HIGH |
| 6 | Dead billing buttons (no onClick handlers) | billing/page.tsx | MEDIUM |
| 7 | Hardcoded APP_URL | constants.ts | MEDIUM |
| 8 | Hardcoded copyright year 2024→2025 | footer.tsx | LOW |
| 9 | Clipboard API without error handling | qr-display.tsx, qr-section.tsx, contact-buttons.tsx | HIGH |
| 10 | Incomplete account status check | [slug]/page.tsx | HIGH |

## Branding Changes
All "mini web" / "Mini Web" / "mini site" references replaced with "QAIROSS" / "QAIROSS" / "centro digital" across 20+ files.

## Verification
- `bun run lint`: 0 errors, 3 pre-existing warnings
- Dev server: Running without errors
- `rg "mini web|Mini Web|mini site"` in src/: 0 results
