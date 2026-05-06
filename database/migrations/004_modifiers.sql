-- Migration: 004_modifiers
-- Description: Product modifiers system

-- Modifier groups (e.g., "Tamaño", "Extras", "Color")
CREATE TABLE modifier_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  product_id UUID REFERENCES menu_items(id) ON DELETE CASCADE, -- null = global group
  name TEXT NOT NULL,
  selection_type TEXT NOT NULL DEFAULT 'single', -- single, multiple, quantity
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_template BOOLEAN DEFAULT false, -- reusable template
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_modifier_groups_site ON modifier_groups(site_id);
CREATE INDEX idx_modifier_groups_product ON modifier_groups(product_id);

-- Modifier options within groups
CREATE TABLE modifier_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  extra_cost DECIMAL(10,2) DEFAULT 0.00,
  has_extra_cost BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_modifier_options_group ON modifier_options(group_id);

-- Store selected modifiers per order item
CREATE TABLE order_item_modifiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_option_id UUID REFERENCES modifier_options(id),
  modifier_group_name TEXT NOT NULL,
  option_name TEXT NOT NULL,
  extra_cost DECIMAL(10,2) DEFAULT 0.00,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_order_item_modifiers_item ON order_item_modifiers(order_item_id);

-- Add fields to menu_items for product enhancements
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL;
-- badge options: 'new', 'popular', 'sold_out', null
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS special_instructions_enabled BOOLEAN DEFAULT true;

-- Add modifiers enabled toggle to mini_sites
ALTER TABLE mini_sites ADD COLUMN IF NOT EXISTS modifiers_enabled BOOLEAN DEFAULT false;
