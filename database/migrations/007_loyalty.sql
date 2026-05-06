-- Migration: 007_loyalty
-- Description: Loyalty card system

-- Loyalty program configuration per business
CREATE TABLE loyalty_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  accumulation_type TEXT DEFAULT 'visits', -- visits, amount, both
  target_value INTEGER DEFAULT 10, -- number of visits or minimum amount
  reward_type TEXT DEFAULT 'discount', -- discount, free_product, custom
  reward_value DECIMAL(10,2) DEFAULT 0.00, -- % for discount, $ for free_product
  reward_label TEXT DEFAULT 'Recompensa', -- custom label
  welcome_gift_enabled BOOLEAN DEFAULT false,
  welcome_gift_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_loyalty_configs_site ON loyalty_configs(site_id);

-- Business customers (end users who register in the business app)
CREATE TABLE business_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- if registered via Google/Facebook
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  has_whatsapp BOOLEAN DEFAULT false,
  email TEXT,
  birthday DATE,
  gender TEXT,
  city TEXT,
  postal_code TEXT,
  registration_method TEXT DEFAULT 'manual', -- manual, google, facebook
  profile_completed BOOLEAN DEFAULT false,
  visits_count INTEGER DEFAULT 0,
  total_purchases DECIMAL(12,2) DEFAULT 0.00,
  current_progress INTEGER DEFAULT 0, -- progress toward loyalty reward
  rewards_earned INTEGER DEFAULT 0,
  rewards_redeemed INTEGER DEFAULT 0,
  qr_checkin_code TEXT UNIQUE, -- unique code for QR check-in
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_business_customers_site ON business_customers(site_id);
CREATE INDEX idx_business_customers_phone ON business_customers(phone);
CREATE INDEX idx_business_customers_email ON business_customers(email);
CREATE INDEX idx_business_customers_qr ON business_customers(qr_checkin_code);

-- Loyalty transactions
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES business_customers(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- visit, purchase, check_in, reward_earned, reward_redeemed, manual_adjustment
  value DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  created_by UUID REFERENCES users(id), -- who manually triggered it (null if automatic)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_site ON loyalty_transactions(site_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);

-- Registration field configuration (what fields the business owner wants to collect)
CREATE TABLE registration_field_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL, -- birthday, phone, whatsapp, gender, city, postal_code, full_name
  is_enabled BOOLEAN DEFAULT false,
  label TEXT, -- custom label shown to customer
  message TEXT, -- custom message shown to customer
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, field_name)
);
CREATE INDEX idx_reg_field_configs_site ON registration_field_configs(site_id);
