-- Migration: 001_landing_content
-- Description: Landing page editable sections stored as JSON
-- Each row = one section of the landing page

-- Landing page editable sections stored as JSON
-- Each row = one section of the landing page
CREATE TABLE landing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE, -- e.g., 'hero', 'benefits', 'pricing', 'cta', 'faq', 'testimonials', 'how_it_works', 'footer'
  section_type TEXT NOT NULL DEFAULT 'json', -- json, image
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}', -- structured content for the section
  images JSONB DEFAULT '[]', -- array of {key, url, alt}
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_landing_content_section ON landing_content(section_key);
CREATE INDEX idx_landing_content_active ON landing_content(is_active);
