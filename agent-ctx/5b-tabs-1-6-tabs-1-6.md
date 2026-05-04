# Task 5b-tabs-1-6 — Editor Tab Components 1–6

**Agent**: tabs-1-6
**Date**: 2025-07-14
**Status**: Completed

## Summary

Created the first 6 tab components for the mini web editor in `/home/z/my-project/src/components/editor/`.

## Files Created

1. `tab-datos.tsx` — Datos Principales (business info, logo/favicon upload, slug, publish toggle)
2. `tab-diseno.tsx` — Diseño y Colores (color presets, custom colors, background type, theme mode)
3. `tab-redes.tsx` — Redes Sociales (12 standard types + custom links, toggle/URL/reorder)
4. `tab-contacto.tsx` — Botones de Contacto (8 button types, toggle/value/reorder)
5. `tab-ubicaciones.tsx` — Ubicaciones (CRUD locations with inline edit forms)
6. `tab-slides.tsx` — Slides / Carrusel (max 5 slides with image upload, fields, reorder)

## Key Patterns

- All `"use client"`, import `useEditorStore` from `@/lib/editor-store`
- Import constants from `@/lib/constants` (SOCIAL_TYPES, CONTACT_BUTTON_TYPES, COLOR_PRESETS, BACKGROUND_TYPES)
- Import shadcn/ui: Card, CardHeader, CardTitle, CardContent, Input, Label, Textarea, Switch, Button, RadioGroup, Separator
- Import Lucide icons with gold (#D4A849) accent
- Import `toast` from `sonner`
- All text in Spanish
- Optimistic updates: temp IDs via `crypto.randomUUID()`, store updated immediately, API synced after
- File uploads: hidden `<input type="file">` via createElement, POST `/api/upload`, 2MB max
- Slug validation: debounced with availability indicator
- Reorder: swap sortOrder + persist via PUT

## Lint

0 errors in new files. Fixed one hooks rule violation (useRef called after conditional return in tab-datos.tsx).
