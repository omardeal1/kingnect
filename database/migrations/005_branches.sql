-- Migration: 005_branches
-- Description: Independent branches/sucursales

-- Branches / Sucursales
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  state TEXT, -- estado/provincia
  city TEXT, -- ciudad
  address TEXT, -- dirección completa
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  maps_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  show_qaiross_brand BOOLEAN DEFAULT true, -- per-branch branding
  hours JSONB DEFAULT '{}', -- {mon: {open, close}, tue: ..., ...}
  social_links JSONB DEFAULT '{}',
  theme_overrides JSONB DEFAULT '{}', -- optional per-branch theme overrides
  button_style TEXT DEFAULT 'cylinder_pill',
  modifiers_enabled BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);
CREATE INDEX idx_branches_site ON branches(site_id);
CREATE INDEX idx_branches_slug ON branches(slug);
CREATE INDEX idx_branches_state_city ON branches(state, city);
CREATE INDEX idx_branches_active ON branches(is_active);
