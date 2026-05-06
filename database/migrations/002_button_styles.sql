-- Migration: 002_button_styles
-- Description: Add button style preference to mini_sites

-- Add button style preference to mini_sites
ALTER TABLE mini_sites ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'cylinder_pill';
-- button_style options: 'cylinder_pill', 'square_soft', 'icon_only', 'glassmorphism', 'outline_elegant'
