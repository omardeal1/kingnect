-- Migration: 009_product_limits
-- Description: Product limits per plan

-- Add product limit fields to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_products INTEGER DEFAULT -1;
-- -1 = unlimited, 0 = no products, N = max N products

ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_branches INTEGER DEFAULT -1;
-- -1 = unlimited

ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_menu_items INTEGER DEFAULT -1;
-- -1 = unlimited

-- Add custom text fields to mini_sites for editable business text
ALTER TABLE mini_sites ADD COLUMN IF NOT EXISTS custom_texts JSONB DEFAULT '{}';
-- Flexible JSON for any custom text the business owner wants to edit

-- Add notification preferences for future use
ALTER TABLE mini_sites ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}';
-- {whatsapp: bool, sms: bool, email: bool, push: bool} - for future marketing
