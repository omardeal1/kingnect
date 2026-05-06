-- Migration: 008_branding_control
-- Description: Platform branding control
-- Uses existing show_qaiross_brand column on mini_sites
-- Add platform-level control

-- Branding control: which clients show "Hecho por QAIROSS"
-- Uses existing show_qaiross_brand column on mini_sites
-- Add platform-level control
ALTER TABLE clients ADD COLUMN IF NOT EXISTS can_control_branding BOOLEAN DEFAULT false;
-- When true, the client can toggle their own branding
-- When false, only super admin controls it
