-- Migration: 003_reservations
-- Description: Full reservations module

-- Reservation configuration per business site
CREATE TABLE reservation_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  reservation_type TEXT DEFAULT 'appointment', -- appointment, table, space, class, service, custom
  custom_type_label TEXT, -- for custom type
  slot_duration_minutes INTEGER DEFAULT 30,
  max_capacity_per_slot INTEGER DEFAULT 1,
  min_advance_hours INTEGER DEFAULT 1,
  max_advance_days INTEGER DEFAULT 30,
  auto_approve BOOLEAN DEFAULT true,
  confirmation_message TEXT DEFAULT 'Tu reservación ha sido confirmada',
  google_calendar_connected BOOLEAN DEFAULT false,
  google_calendar_id TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMPTZ,
  available_days JSONB DEFAULT '[1,2,3,4,5]', -- [0=Sun, 1=Mon, ..., 6=Sat]
  time_slots JSONB DEFAULT '[]', -- [{start: "09:00", end: "17:00"}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reservation_configs_site ON reservation_configs(site_id);

-- Reservations
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_whatsapp BOOLEAN DEFAULT false,
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- e.g., "09:00-09:30"
  party_size INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending', -- pending, approved, cancelled, completed, no_show
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reservations_site ON reservations(site_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
