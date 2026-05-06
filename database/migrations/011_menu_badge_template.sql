-- ============================================================
-- Migration 011: Menu Badge + Menu Template + Featured Slides
-- ============================================================

-- 1. Campo badge en menu_items (ya puede existir, lo creamos con IF NOT EXISTS)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS badge TEXT;

-- 2. Menu template en mini_sites
ALTER TABLE mini_sites ADD COLUMN IF NOT EXISTS menu_template TEXT DEFAULT 'fresh_modern';

-- 3. Tabla menu_featured_slides (fotos destacadas del menú)
CREATE TABLE IF NOT EXISTS menu_featured_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  sort_order INT DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_featured_slides_site_id ON menu_featured_slides(site_id);
