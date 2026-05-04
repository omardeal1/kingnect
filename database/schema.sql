-- ============================================
-- KINGNECT — Esquema SQL de Referencia
-- Compatible con Supabase / PostgreSQL
-- ============================================
-- Este archivo es solo documentación.
-- La base de datos real usa Prisma + SQLite.
-- Este SQL sirve como referencia para migrar a Supabase.
-- ============================================

-- Habilitar extensión UUID (Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabla: users
-- Usuarios del sistema (super_admin y clientes)
-- ============================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT,
  email         TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMPTZ,
  password_hash TEXT,
  image         TEXT,
  role          TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('super_admin', 'client')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Usuarios del sistema: administradores y clientes';
COMMENT ON COLUMN users.role IS 'Rol del usuario: super_admin o client';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña';

-- ============================================
-- Tabla: accounts
-- Cuentas OAuth vinculadas a usuarios (NextAuth)
-- ============================================
CREATE TABLE accounts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               TEXT NOT NULL,
  provider           TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token      TEXT,
  access_token       TEXT,
  expires_at         INTEGER,
  token_type         TEXT,
  scope              TEXT,
  id_token           TEXT,
  session_state      TEXT,
  UNIQUE(provider, provider_account_id)
);

COMMENT ON TABLE accounts IS 'Cuentas OAuth vinculadas a usuarios (proveedores de autenticación)';

-- ============================================
-- Tabla: sessions
-- Sesiones activas de usuarios (NextAuth)
-- ============================================
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT NOT NULL UNIQUE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

COMMENT ON TABLE sessions IS 'Sesiones activas de autenticación';

-- ============================================
-- Tabla: verification_tokens
-- Tokens de verificación (email, reseteo de contraseña)
-- ============================================
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires    TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

COMMENT ON TABLE verification_tokens IS 'Tokens temporales para verificación de email y reseteo de contraseña';

-- ============================================
-- Tabla: clients
-- Perfiles de negocio de los clientes
-- ============================================
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id   UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL,
  contact_name    TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  email           TEXT,
  pipeline_status TEXT NOT NULL DEFAULT 'lead' CHECK (pipeline_status IN ('lead', 'contacted', 'demo', 'active', 'churned')),
  account_status  TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'blocked', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE clients IS 'Perfiles de negocio de los clientes de la plataforma';
COMMENT ON COLUMN clients.pipeline_status IS 'Estado del embudo de ventas: lead, contacted, demo, active, churned';
COMMENT ON COLUMN clients.account_status IS 'Estado de la cuenta: active, blocked, cancelled';

-- ============================================
-- Tabla: plans
-- Planes de suscripción disponibles
-- ============================================
CREATE TABLE plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  price            DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  trial_days       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  features         JSONB NOT NULL DEFAULT '{}',
  limits           JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE plans IS 'Planes de suscripción con precios, características y límites';
COMMENT ON COLUMN plans.features IS 'Objeto JSON con las características incluidas en el plan';
COMMENT ON COLUMN plans.limits IS 'Objeto JSON con los límites del plan (mini_sites, links, etc.)';

-- ============================================
-- Tabla: subscriptions
-- Suscripciones activas de los clientes
-- ============================================
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id             UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  plan_id               UUID NOT NULL REFERENCES plans(id),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id       TEXT,
  status                TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'past_due', 'cancelled', 'inactive', 'trial')),
  trial_start           TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  blocked_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE subscriptions IS 'Suscripciones de clientes a planes con integración Stripe';
COMMENT ON COLUMN subscriptions.status IS 'Estado de la suscripción: active, past_due, cancelled, inactive, trial';

-- ============================================
-- Tabla: mini_sites
-- Mini sitios web de cada cliente (landing con links)
-- ============================================
CREATE TABLE mini_sites (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id            UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  slug                 TEXT NOT NULL UNIQUE,
  business_name        TEXT NOT NULL,
  tagline              TEXT,
  description          TEXT,
  logo_url             TEXT,
  favicon_url          TEXT,
  background_type      TEXT NOT NULL DEFAULT 'color' CHECK (background_type IN ('color', 'gradient', 'image')),
  background_color     TEXT NOT NULL DEFAULT '#FFFFFF',
  background_gradient  TEXT,
  background_image_url TEXT,
  card_color           TEXT NOT NULL DEFAULT '#FFFFFF',
  text_color           TEXT NOT NULL DEFAULT '#0A0A0A',
  accent_color         TEXT NOT NULL DEFAULT '#D4A849',
  theme_mode           TEXT NOT NULL DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'both')),
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  is_published         BOOLEAN NOT NULL DEFAULT FALSE,
  show_king_brand      BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title           TEXT,
  meta_description     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE mini_sites IS 'Mini sitios web de cada cliente — la landing page con todos sus links y QR';
COMMENT ON COLUMN mini_sites.slug IS 'Identificador único en la URL del mini sitio';
COMMENT ON COLUMN mini_sites.background_type IS 'Tipo de fondo: color sólido, gradiente o imagen';
COMMENT ON COLUMN mini_sites.theme_mode IS 'Modo del tema: claro, oscuro o ambos';

-- ============================================
-- Tabla: social_links
-- Redes sociales vinculadas a un mini sitio
-- ============================================
CREATE TABLE social_links (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('facebook', 'instagram', 'tiktok', 'pinterest', 'youtube', 'linkedin', 'twitter', 'snapchat', 'threads', 'yelp', 'google_reviews', 'website', 'custom')),
  label        TEXT,
  url          TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE social_links IS 'Enlaces a redes sociales de un mini sitio';

-- ============================================
-- Tabla: contact_buttons
-- Botones de contacto de un mini sitio (WhatsApp, llamada, etc.)
-- ============================================
CREATE TABLE contact_buttons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('whatsapp', 'call', 'sms', 'email', 'maps', 'share', 'copy_link', 'order')),
  label        TEXT,
  value        TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE contact_buttons IS 'Botones de acción rápida para contacto (WhatsApp, llamada, SMS, email, etc.)';

-- ============================================
-- Tabla: locations
-- Ubicaciones físicas del negocio
-- ============================================
CREATE TABLE locations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  address      TEXT,
  maps_url     TEXT,
  hours        TEXT,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE locations IS 'Ubicaciones físicas del negocio con horarios y enlace a Google Maps';

-- ============================================
-- Tabla: slides
-- Diapositivas del carrusel/banner del mini sitio
-- ============================================
CREATE TABLE slides (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  image_url    TEXT,
  title        TEXT,
  subtitle     TEXT,
  button_label TEXT,
  button_url   TEXT,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE slides IS 'Diapositivas del carrusel o banner principal del mini sitio';

-- ============================================
-- Tabla: menu_categories
-- Categorías del menú (para restaurantes y similares)
-- ============================================
CREATE TABLE menu_categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE menu_categories IS 'Categorías del menú de productos de un mini sitio';

-- ============================================
-- Tabla: menu_items
-- Productos del menú dentro de una categoría
-- ============================================
CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        DOUBLE PRECISION,
  image_url    TEXT,
  is_orderable BOOLEAN NOT NULL DEFAULT FALSE,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE menu_items IS 'Productos del menú con precio, descripción y opción de pedido';

-- ============================================
-- Tabla: gallery_images
-- Imágenes de la galería del mini sitio
-- ============================================
CREATE TABLE gallery_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  caption      TEXT,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE gallery_images IS 'Imágenes de la galería fotográfica del mini sitio';

-- ============================================
-- Tabla: services
-- Servicios ofrecidos por el negocio
-- ============================================
CREATE TABLE services (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        TEXT,
  image_url    TEXT,
  button_label TEXT,
  button_url   TEXT,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE services IS 'Servicios que ofrece el negocio con precio y botón de acción';

-- ============================================
-- Tabla: testimonials
-- Testimonios/resenas de clientes
-- ============================================
CREATE TABLE testimonials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  photo_url    TEXT,
  rating       INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content      TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE testimonials IS 'Testimonios y reseñas de clientes del negocio';

-- ============================================
-- Tabla: custom_links
-- Enlaces personalizados del mini sitio
-- ============================================
CREATE TABLE custom_links (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  url          TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE custom_links IS 'Enlaces personalizados que el cliente quiere mostrar en su mini sitio';

-- ============================================
-- Tabla: orders
-- Pedidos realizados desde el mini sitio
-- ============================================
CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id   UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT,
  delivery_type  TEXT NOT NULL DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total          DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Pedidos realizados desde el menú del mini sitio';
COMMENT ON COLUMN orders.delivery_type IS 'Tipo de entrega: pickup (recoger) o delivery (domicilio)';
COMMENT ON COLUMN orders.status IS 'Estado del pedido: new, confirmed, preparing, ready, delivered, cancelled';

-- ============================================
-- Tabla: order_items
-- Productos individuales dentro de un pedido
-- ============================================
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  total      DOUBLE PRECISION NOT NULL DEFAULT 0
);

COMMENT ON TABLE order_items IS 'Líneas de producto dentro de un pedido';

-- ============================================
-- Tabla: platform_settings
-- Configuración global de la plataforma
-- ============================================
CREATE TABLE platform_settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'json', 'number', 'boolean')),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE platform_settings IS 'Configuración global de la plataforma (nombre, colores, URLs, etc.)';

-- ============================================
-- Tabla: platform_sections
-- Secciones de contenido de la landing page de la plataforma
-- ============================================
CREATE TABLE platform_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL UNIQUE,
  title       TEXT,
  subtitle    TEXT,
  content     TEXT,
  image_url   TEXT,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE platform_sections IS 'Secciones editables de la página principal de la plataforma';

-- ============================================
-- Tabla: analytics_events
-- Eventos de analítica de los mini sitios
-- ============================================
CREATE TABLE analytics_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_site_id UUID NOT NULL REFERENCES mini_sites(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL CHECK (event_type IN ('view', 'click_whatsapp', 'click_link', 'order_created', 'qr_scan')),
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE analytics_events IS 'Eventos de analítica: visitas, clics, pedidos y escaneos de QR';
COMMENT ON COLUMN analytics_events.event_type IS 'Tipo de evento: view, click_whatsapp, click_link, order_created, qr_scan';

-- ============================================
-- Tabla: activity_logs
-- Registro de actividad de los usuarios
-- ============================================
CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activity_logs IS 'Registro histórico de acciones realizadas por los usuarios';

-- ============================================
-- Índices para optimizar consultas frecuentes
-- ============================================
CREATE INDEX idx_clients_owner_user_id ON clients(owner_user_id);
CREATE INDEX idx_clients_pipeline_status ON clients(pipeline_status);
CREATE INDEX idx_clients_account_status ON clients(account_status);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_mini_sites_client_id ON mini_sites(client_id);
CREATE INDEX idx_mini_sites_slug ON mini_sites(slug);
CREATE INDEX idx_social_links_mini_site_id ON social_links(mini_site_id);
CREATE INDEX idx_contact_buttons_mini_site_id ON contact_buttons(mini_site_id);
CREATE INDEX idx_locations_mini_site_id ON locations(mini_site_id);
CREATE INDEX idx_slides_mini_site_id ON slides(mini_site_id);
CREATE INDEX idx_menu_categories_mini_site_id ON menu_categories(mini_site_id);
CREATE INDEX idx_menu_items_mini_site_id ON menu_items(mini_site_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_gallery_images_mini_site_id ON gallery_images(mini_site_id);
CREATE INDEX idx_services_mini_site_id ON services(mini_site_id);
CREATE INDEX idx_testimonials_mini_site_id ON testimonials(mini_site_id);
CREATE INDEX idx_custom_links_mini_site_id ON custom_links(mini_site_id);
CREATE INDEX idx_orders_mini_site_id ON orders(mini_site_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_analytics_events_mini_site_id ON analytics_events(mini_site_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_platform_settings_key ON platform_settings(key);
