-- ============================================
-- KINGNECT — Datos Iniciales (Seed)
-- Compatible con Supabase / PostgreSQL
-- ============================================
-- Este archivo inserta los datos base necesarios
-- para que la plataforma funcione correctamente.
-- Ejecutar después de schema.sql
-- ============================================

-- ============================================
-- Planes de Suscripción
-- ============================================
INSERT INTO plans (id, name, slug, price, currency, billing_interval, trial_days, is_active, sort_order, features, limits) VALUES
(
  'plan-trial-0000-0000-000000000001',
  'Trial',
  'trial',
  0.00,
  'USD',
  'month',
  7,
  TRUE,
  1,
  '{"mini_sites": 1, "social_links": 5, "contact_buttons": 3, "gallery_images": 5, "custom_links": 3, "locations": 1, "services": 3, "testimonials": 0, "menu_items": 0, "orders": false, "analytics": false, "custom_domain": false, "remove_branding": false}'::jsonb,
  '{"mini_sites": 1, "social_links": 5, "contact_buttons": 3, "gallery_images": 5, "custom_links": 3, "locations": 1, "services": 3}'::jsonb
),
(
  'plan-basico-0000-0000-000000000002',
  'Básico',
  'basico',
  9.99,
  'USD',
  'month',
  0,
  TRUE,
  2,
  '{"mini_sites": 1, "social_links": 15, "contact_buttons": 5, "gallery_images": 20, "custom_links": 10, "locations": 2, "services": 10, "testimonials": 5, "menu_items": 0, "orders": false, "analytics": true, "custom_domain": false, "remove_branding": false}'::jsonb,
  '{"mini_sites": 1, "social_links": 15, "contact_buttons": 5, "gallery_images": 20, "custom_links": 10, "locations": 2, "services": 10, "testimonials": 5}'::jsonb
),
(
  'plan-pro-000000-0000-000000000003',
  'Pro',
  'pro',
  24.99,
  'USD',
  'month',
  0,
  TRUE,
  3,
  '{"mini_sites": 3, "social_links": 30, "contact_buttons": 10, "gallery_images": 50, "custom_links": 25, "locations": 5, "services": 25, "testimonials": 15, "menu_items": 50, "orders": true, "analytics": true, "custom_domain": true, "remove_branding": false}'::jsonb,
  '{"mini_sites": 3, "social_links": 30, "contact_buttons": 10, "gallery_images": 50, "custom_links": 25, "locations": 5, "services": 25, "testimonials": 15, "menu_items": 50}'::jsonb
),
(
  'plan-premium-00-0000-000000000004',
  'Premium',
  'premium',
  49.99,
  'USD',
  'month',
  0,
  TRUE,
  4,
  '{"mini_sites": -1, "social_links": -1, "contact_buttons": -1, "gallery_images": -1, "custom_links": -1, "locations": -1, "services": -1, "testimonials": -1, "menu_items": -1, "orders": true, "analytics": true, "custom_domain": true, "remove_branding": true, "priority_support": true, "white_label": true}'::jsonb,
  '{"mini_sites": -1, "social_links": -1, "contact_buttons": -1, "gallery_images": -1, "custom_links": -1, "locations": -1, "services": -1, "testimonials": -1, "menu_items": -1}'::jsonb
);

COMMENT ON TABLE plans IS 'Planes: Trial (gratuito 7 días), Básico ($9.99/mes), Pro ($24.99/mes), Premium ($49.99/mes). -1 en límites = ilimitado.';

-- ============================================
-- Super Administrador
-- Contraseña: Kingnect2024! (hash bcrypt generado)
-- En producción usar un hash real: bun -e "console.log(require('bcryptjs').hashSync('Kingnect2024!', 12))"
-- ============================================
INSERT INTO users (id, name, email, email_verified, password_hash, role) VALUES
(
  'user-superadmin-0000-000000000001',
  'Kingnect Admin',
  'admin@kingnect.com',
  NOW(),
  '$2a$12$placeholder_bcrypt_hash_change_in_production',
  'super_admin'
);

COMMENT ON TABLE users IS 'Super admin por defecto: admin@kingnect.com — cambiar contraseña en producción';

-- ============================================
-- Configuración de la Plataforma
-- ============================================
INSERT INTO platform_settings (key, value, type, updated_by) VALUES
-- Nombre de la aplicación que se muestra en la interfaz y título del navegador
('app_name',            'Kingnect',                                                      'text',    'user-superadmin-0000-000000000001'),
-- URL base de la aplicación (usada para generar enlaces absolutos)
('app_url',             'http://localhost:3000',                                          'text',    'user-superadmin-0000-000000000001'),
-- Color primario de la marca (dorado Kingnect)
('primary_color',       '#D4A849',                                                        'text',    'user-superadmin-0000-000000000001'),
-- Color secundario de la marca
('secondary_color',     '#1A1A2E',                                                        'text',    'user-superadmin-0000-000000000001'),
-- Color de fondo principal del panel administrativo
('bg_color',            '#F8F9FA',                                                        'text',    'user-superadmin-0000-000000000001'),
-- Moneda por defecto para los planes de suscripción
('default_currency',    'USD',                                                            'text',    'user-superadmin-0000-000000000001'),
-- Idioma por defecto de la plataforma
('default_language',    'es',                                                             'text',    'user-superadmin-0000-000000000001'),
-- Mostrar o no la marca "Powered by Kingnect" en los mini sitios gratuitos
('show_branding',       'true',                                                           'boolean', 'user-superadmin-0000-000000000001'),
-- Habilitar o deshabilitar el registro público de nuevos clientes
('allow_registration',  'true',                                                           'boolean', 'user-superadmin-0000-000000000001'),
-- Duración del período de prueba en días (para planes con trial)
('trial_duration_days', '7',                                                              'number',  'user-superadmin-0000-000000000001'),
-- Correo de soporte técnico visible para los clientes
('support_email',       'soporte@kingnect.com',                                           'text',    'user-superadmin-0000-000000000001'),
-- URL del sitio web principal de Kingnect
('king_website_url',    'https://kingdesigns.co',                                          'text',    'user-superadmin-0000-000000000001'),
-- Mensaje de bienvenida que ven los clientes al registrarse
('welcome_message',     '¡Bienvenido a Kingnect! Crea tu mini web profesional en minutos.', 'text',    'user-superadmin-0000-000000000001'),
-- Configuración de SEO por defecto para mini sitios nuevos
('default_meta_title',       'Kingnect — Todos tus links en un solo lugar',               'text',    'user-superadmin-0000-000000000001'),
('default_meta_description', 'Crea tu mini web profesional con QR y comparte todos los enlaces de tu negocio al instante.', 'text', 'user-superadmin-0000-000000000001'),
-- Habilitar módulo de pedidos online globalmente
('orders_enabled',      'true',                                                           'boolean', 'user-superadmin-0000-000000000001'),
-- Habilitar módulo de analíticas globalmente
('analytics_enabled',   'true',                                                           'boolean', 'user-superadmin-0000-000000000001');

-- ============================================
-- Secciones de la Página Principal (Landing)
-- ============================================
INSERT INTO platform_sections (section_key, title, subtitle, content, enabled, sort_order) VALUES
-- Sección Hero (encabezado principal)
('hero',
  'Todos los links de tu negocio en una mini web profesional',
  'Crea tu página de enlaces con QR personalizable en minutos. Sin código, sin complicaciones.',
  'Impulsa tu presencia digital con una mini web que concentra todas tus redes sociales, contacto, servicios y más. Comparte tu QR y conecta con más clientes.',
  TRUE, 1),

-- Sección de Características
('features',
  'Todo lo que necesitas para destacar',
  'Herramientas poderosas para que tu negocio brille en línea',
  NULL,
  TRUE, 2),

-- Sección de Planes y Precios
('pricing',
  'Elige el plan perfecto para tu negocio',
  'Desde gratis hasta premium, tenemos la solución ideal',
  NULL,
  TRUE, 3),

-- Sección de Testimonios
('testimonials',
  'Lo que dicen nuestros clientes',
  'Negocios reales, resultados reales',
  NULL,
  TRUE, 4),

-- Sección de Llamada a la Acción (CTA)
('cta',
  '¿Listo para transformar tu presencia digital?',
  'Únete a cientos de negocios que ya usan Kingnect',
  'Comienza tu prueba gratuita de 7 días. Sin tarjeta de crédito.',
  TRUE, 5),

-- Sección Footer
('footer',
  'Kingnect by King Designs',
  NULL,
  'Todos los derechos reservados.',
  TRUE, 6);

-- ============================================
-- Fin del archivo seed
-- ============================================
