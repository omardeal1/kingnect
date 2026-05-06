#!/usr/bin/env python3
# ─── QAIROSS — Guía de Despliegue a Producción ─────────────────────────────────
# Genera un PDF profesional con la guía completa para deployar la plataforma
# QAIROSS en producción con Vercel + Supabase + Stripe

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ─── Font Registration ───────────────────────────────────────────────────────
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))

registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ─── Color Palette ───────────────────────────────────────────────────────────
ACCENT       = colors.HexColor('#4c22c7')
TEXT_PRIMARY  = colors.HexColor('#1d1d1b')
TEXT_MUTED    = colors.HexColor('#7e7a72')
BG_SURFACE   = colors.HexColor('#e0ddd6')
BG_PAGE      = colors.HexColor('#edecea')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ─── Styles ──────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
LEFT_M = 1.0 * inch
RIGHT_M = 1.0 * inch
TOP_M = 0.8 * inch
BOTTOM_M = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_M - RIGHT_M

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='GuideTitle', fontName='Carlito', fontSize=28,
    leading=36, alignment=TA_CENTER, textColor=ACCENT,
    spaceAfter=6
)

subtitle_style = ParagraphStyle(
    name='GuideSubtitle', fontName='Carlito', fontSize=14,
    leading=20, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceAfter=24
)

h1_style = ParagraphStyle(
    name='H1', fontName='Carlito', fontSize=20,
    leading=28, textColor=ACCENT, spaceBefore=18, spaceAfter=10
)

h2_style = ParagraphStyle(
    name='H2', fontName='Carlito', fontSize=15,
    leading=22, textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8
)

h3_style = ParagraphStyle(
    name='H3', fontName='Carlito', fontSize=12,
    leading=18, textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6
)

body_style = ParagraphStyle(
    name='Body', fontName='Carlito', fontSize=10.5,
    leading=17, alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
    spaceAfter=8
)

code_style = ParagraphStyle(
    name='Code', fontName='DejaVuSans', fontSize=8.5,
    leading=13, textColor=colors.HexColor('#1a1a2e'),
    backColor=colors.HexColor('#f4f4f8'),
    leftIndent=12, rightIndent=12,
    spaceBefore=6, spaceAfter=6,
    borderPadding=6
)

bullet_style = ParagraphStyle(
    name='Bullet', fontName='Carlito', fontSize=10.5,
    leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    leftIndent=20, spaceAfter=4, bulletIndent=8
)

callout_style = ParagraphStyle(
    name='Callout', fontName='Carlito', fontSize=10,
    leading=16, textColor=ACCENT, leftIndent=16, rightIndent=16,
    spaceBefore=8, spaceAfter=8, borderPadding=8,
    borderColor=ACCENT, borderWidth=1, borderRadius=4
)

header_cell_style = ParagraphStyle(
    name='HeaderCell', fontName='Carlito', fontSize=10,
    leading=14, textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    name='CellStyle', fontName='Carlito', fontSize=9.5,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    wordWrap='CJK'
)

cell_center_style = ParagraphStyle(
    name='CellCenter', fontName='Carlito', fontSize=9.5,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_CENTER
)

# ─── Helpers ─────────────────────────────────────────────────────────────────
def heading1(text):
    return Paragraph(f'<b>{text}</b>', h1_style)

def heading2(text):
    return Paragraph(f'<b>{text}</b>', h2_style)

def heading3(text):
    return Paragraph(f'<b>{text}</b>', h3_style)

def body(text):
    return Paragraph(text, body_style)

def code(text):
    safe = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return Paragraph(safe, code_style)

def bullet(text):
    return Paragraph(f'<bullet>&bull;</bullet> {text}', bullet_style)

def spacer(h=12):
    return Spacer(1, h)

def make_table(headers, rows, col_widths=None):
    """Create a professionally styled table."""
    header_row = [Paragraph(f'<b>{h}</b>', header_cell_style) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), cell_style) for c in row])

    if col_widths is None:
        col_widths = [AVAILABLE_W / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ─── Page Template ───────────────────────────────────────────────────────────
def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Carlito', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawCentredString(PAGE_W / 2, 0.5 * inch, f'QAIROSS - Guia de Despliegue a Produccion | Pagina {doc.page}')
    canvas.restoreState()

# ─── Build PDF ───────────────────────────────────────────────────────────────
output_path = '/home/z/my-project/download/QAIROSS-Guia-Deploy-Produccion.pdf'

doc = SimpleDocTemplate(
    output_path, pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOTTOM_M
)

story = []

# ─── Cover Page ──────────────────────────────────────────────────────────────
story.append(Spacer(1, 2.0 * inch))
story.append(Paragraph('<b>QAIROSS</b>', title_style))
story.append(Spacer(1, 8))
story.append(Paragraph('Guia Completa de Despliegue a Produccion', subtitle_style))
story.append(Spacer(1, 24))
story.append(Paragraph('Plataforma SaaS para Centros Digitales con QR', ParagraphStyle(
    name='CoverDesc', fontName='Carlito', fontSize=12,
    leading=18, alignment=TA_CENTER, textColor=TEXT_MUTED
)))
story.append(Spacer(1, 36))

cover_info = [
    ['Dominio', 'links.qaiross.app'],
    ['Plataforma', 'Vercel + Supabase + Stripe'],
    ['Framework', 'Next.js 16 (App Router)'],
    ['Base de Datos', 'PostgreSQL (Supabase)'],
    ['Version', '1.0.0'],
]
cover_table = Table(cover_info, colWidths=[2.0*inch, 3.0*inch], hAlign='CENTER')
cover_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (0, -1), 'Carlito'),
    ('FONTNAME', (1, 0), (1, -1), 'Carlito'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('TEXTCOLOR', (0, 0), (0, -1), ACCENT),
    ('TEXTCOLOR', (1, 0), (1, -1), TEXT_PRIMARY),
    ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ('LEFTPADDING', (0, 0), (-1, -1), 12),
    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LINEBELOW', (0, 0), (-1, -2), 0.5, BG_SURFACE),
]))
story.append(cover_table)
story.append(Spacer(1, 48))
story.append(Paragraph('por QAIROSS', ParagraphStyle(
    name='CoverFooter', fontName='Carlito', fontSize=11,
    leading=16, alignment=TA_CENTER, textColor=TEXT_MUTED
)))

story.append(PageBreak())

# ─── Tabla de Contenido ─────────────────────────────────────────────────────
story.append(Paragraph('<b>Contenido</b>', h1_style))
story.append(spacer(12))

toc_items = [
    ('1', 'Resumen de Arquitectura'),
    ('2', 'Paso 1: Configurar Supabase (Base de Datos + Storage)'),
    ('3', 'Paso 2: Configurar Stripe (Pagos)'),
    ('4', 'Paso 3: Configurar Resend (Emails)'),
    ('5', 'Paso 4: Desplegar en Vercel'),
    ('6', 'Paso 5: Configurar Dominio Personalizado'),
    ('7', 'Paso 6: Variables de Entorno en Vercel'),
    ('8', 'Paso 7: Migrar Base de Datos y Seed'),
    ('9', 'Paso 8: Configurar Webhooks de Stripe'),
    ('10', 'Paso 9: Verificacion Final y Go-Live'),
    ('11', 'Checklist de Produccion'),
    ('12', 'Solucion de Problemas'),
]
for num, title in toc_items:
    story.append(Paragraph(f'<b>{num}.</b>  {title}', ParagraphStyle(
        name=f'TOC{num}', fontName='Carlito', fontSize=11,
        leading=20, leftIndent=20, textColor=TEXT_PRIMARY
    )))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════════════
# 1. RESUMEN DE ARQUITECTURA
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('1. Resumen de Arquitectura'))
story.append(body(
    'QAIROSS es una plataforma SaaS que permite a negocios crear su propio centro digital '
    '(mini web profesional) con codigo QR personalizado. La aplicacion esta construida con '
    'Next.js 16, React 19, TypeScript, Tailwind CSS y shadcn/ui en el frontend, con Prisma ORM '
    'como capa de datos, NextAuth.js para autenticacion, Stripe para pagos recurrentes y '
    'Supabase para base de datos PostgreSQL y almacenamiento de archivos.'
))
story.append(body(
    'La arquitectura de produccion utiliza Vercel como plataforma de hosting, lo cual proporciona '
    'deploy automatico desde Git, SSL gratuito, CDN global, funciones serverless para las rutas API '
    'y escalado automatico. Supabase complementa con PostgreSQL administrado, Storage para archivos '
    'subidos, y conexion directa desde el cliente cuando se necesita. Los pagos se procesan a traves '
    'de Stripe con webhooks para sincronizacion en tiempo real del estado de suscripciones.'
))

story.append(heading2('Stack de Tecnologias'))
story.append(make_table(
    ['Componente', 'Tecnologia', 'Proposito'],
    [
        ['Frontend', 'Next.js 16 + React 19', 'SSR/SSG, App Router, RSC'],
        ['Estilos', 'Tailwind CSS 4 + shadcn/ui', 'Diseno responsive y componentes'],
        ['Base de Datos', 'PostgreSQL (Supabase)', 'Datos persistentes, 19+ tablas'],
        ['ORM', 'Prisma 6', 'Migraciones, tipado, queries'],
        ['Autenticacion', 'NextAuth.js v4', 'JWT + credenciales, RBAC'],
        ['Pagos', 'Stripe', 'Suscripciones, webhooks, portal'],
        ['Emails', 'Resend', 'Recuperar clave, bienvenida'],
        ['Storage', 'Supabase Storage', 'Logos, galeria, favicons'],
        ['Hosting', 'Vercel', 'Deploy, CDN, SSL, serverless'],
        ['Monitoreo', 'Sentry (opcional)', 'Errores y performance'],
    ],
    [1.5*inch, 2.2*inch, 2.3*inch]
))

story.append(spacer(12))
story.append(heading2('Arquitectura de Dominios'))
story.append(body(
    'La plataforma opera bajo dos esquemas de URL principales. El dominio principal '
    '<b>links.qaiross.app</b> es donde reside la aplicacion SaaS (landing, dashboard, admin). '
    'Cada centro digital creado por un cliente se accede via <b>links.qaiross.app/[slug]</b>, '
    'donde [slug] es el identificador unico del negocio. Esta estructura permite que todos los '
    'centros digitales compartan el mismo dominio sin necesidad de subdominios adicionales, '
    'simplificando la gestion de SSL y DNS.'
))

# ═══════════════════════════════════════════════════════════════════════════════
# 2. SUPABASE
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('2. Paso 1: Configurar Supabase'))
story.append(body(
    'Supabase es la base de datos PostgreSQL administrada y el servicio de almacenamiento '
    'de archivos para QAIROSS. A diferencia de SQLite usado en desarrollo, PostgreSQL soporta '
    'tipos de datos avanzados como Decimal para precios, campos Text para contenido largo, '
    'y conexiones concurrentes que una plataforma SaaS en produccion requiere.'
))

story.append(heading2('2.1 Crear el Proyecto'))
story.append(bullet('Ir a <b>supabase.com</b> y crear una cuenta (puedes usar GitHub)')
)
story.append(bullet('Click en "New Project" y completar: Nombre = <b>kinec</b>, Region = <b>US East (N Virginia)</b> para minimizar latencia con Vercel'))
story.append(bullet('Generar una contrasena segura para la base de datos (guardala, no se puede recuperar)'))
story.append(bullet('Esperar 2-3 minutos mientras se aprovisiona el proyecto'))
story.append(spacer(8))

story.append(heading2('2.2 Obtener las Credenciales'))
story.append(body('En el dashboard de Supabase, ve a Settings > API y anota estos valores:'))
story.append(make_table(
    ['Variable', 'Donde Encontrarla', 'Formato'],
    [
        ['DATABASE_URL', 'Settings > Database > Connection string (URI)', 'postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres'],
        ['NEXT_PUBLIC_SUPABASE_URL', 'Settings > API > Project URL', 'https://[ref].supabase.co'],
        ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Settings > API > Project API keys > anon public', 'eyJhbGci...'],
        ['SUPABASE_SERVICE_ROLE_KEY', 'Settings > API > Project API keys > service_role secret', 'eyJhbGci...'],
    ],
    [1.6*inch, 2.4*inch, 2.0*inch]
))

story.append(spacer(8))
story.append(Paragraph('<b>Importante:</b> Usa la conexion <b>Pooler (Transaction mode)</b> con puerto 6543 '
    'para la DATABASE_URL, ya que Vercel usa conexiones serverless que necesitan pooling. '
    'La conexion directa (puerto 5432) agota rapidamente el limite de conexiones.', callout_style))

story.append(heading2('2.3 Crear el Bucket de Storage'))
story.append(bullet('Ve a Storage en el menu lateral de Supabase'))
story.append(bullet('Click en "New bucket" y nombra <b>uploads</b>'))
story.append(bullet('Desmarca "Public bucket" por seguridad'))
story.append(bullet('Ve a Policies del bucket "uploads" y agrega una politica:'))
story.append(code('Allow public read: role = anon, operation = SELECT, using = true'))
story.append(bullet('Esto permite que las imagenes subidas sean accesibles publicamente via URL, '
    'mientras que la escritura solo es posible desde el backend usando la service_role_key'))

story.append(heading2('2.4 Configurar RLS (Row Level Security)'))
story.append(body(
    'Supabase recomienda habilitar RLS en todas las tablas. Sin embargo, como QAIROSS accede a la base '
    'de datos exclusivamente desde el backend (Prisma ORM), las consultas no pasan por el cliente de '
    'Supabase sino por la conexion directa PostgreSQL. Esto significa que RLS no afecta las operaciones '
    'de Prisma. Si en el futuro deseas agregar acceso directo desde el navegador del cliente usando '
    'el Supabase Client, deberas configurar politicas RLS apropiadas para cada tabla.'
))

# ═══════════════════════════════════════════════════════════════════════════════
# 3. STRIPE
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('3. Paso 2: Configurar Stripe'))
story.append(body(
    'Stripe maneja todos los pagos recurrentes de QAIROSS. La integracion ya esta programada '
    'en el codigo: creacion de sesiones de checkout, portal de clientes para gestionar suscripciones, '
    'y webhooks para sincronizar el estado de pagos con la base de datos. Solo necesitas configurar '
    'las credenciales y activar los webhooks.'
))

story.append(heading2('3.1 Crear Cuenta de Stripe'))
story.append(bullet('Ir a <b>stripe.com</b> y crear una cuenta'))
story.append(bullet('Completar la verificacion de negocio (requiere datos fiscales)'))
story.append(bullet('En Settings > Business, configurar el nombre publico: <b>QAIROSS by QAIROSS</b>'))

story.append(heading2('3.2 Obtener Claves API'))
story.append(body('En el dashboard de Stripe, ve a Developers > API keys:'))
story.append(make_table(
    ['Variable', 'Valor', 'Uso'],
    [
        ['STRIPE_SECRET_KEY', 'sk_live_...', 'Clave secreta para el backend (NUNCA exponer)'],
        ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_live_...', 'Clave publica para el frontend'],
    ],
    [2.5*inch, 1.3*inch, 2.2*inch]
))
story.append(spacer(8))
story.append(Paragraph('<b>Importante:</b> Primero prueba con las claves de test (sk_test_... / pk_test_...) '
    'antes de cambiar a las de produccion. Puedes usar el modo test para simular pagos sin '
    'dinero real.', callout_style))

story.append(heading2('3.3 Configurar Productos y Precios'))
story.append(body(
    'QAIROSS ya tiene la logica para crear productos y precios automaticamente en Stripe cuando '
    'un cliente inicia checkout. Sin embargo, es buena practica crear los productos manualmente '
    'en el dashboard de Stripe para tener control sobre los IDs. Ve a Products y crea los 4 planes:'
))

story.append(make_table(
    ['Plan', 'Precio', 'Intervalo', 'Trial'],
    [
        ['Trial', '$0.00', 'Mensual', '30 dias'],
        ['Basico', '$9.99', 'Mensual', 'Sin trial'],
        ['Pro', '$24.99', 'Mensual', 'Sin trial'],
        ['Premium', '$49.99', 'Mensual', 'Sin trial'],
    ],
    [1.2*inch, 1.2*inch, 1.4*inch, 1.2*inch]
))

story.append(heading2('3.4 Configurar Modo de Pago'))
story.append(bullet('Ve a Settings > Payment methods y activa:'))
story.append(bullet('<b>Tarjeta</b> (activado por defecto)'))
story.append(bullet('<b>OXXO</b> (para Mexico, si aplica)'))
story.append(bullet('<b>Transferencia bancaria</b> (opcional, segun pais)'))

# ═══════════════════════════════════════════════════════════════════════════════
# 4. RESEND
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('4. Paso 3: Configurar Resend (Emails)'))
story.append(body(
    'Resend es el servicio de email transaccional de QAIROSS. Se usa para enviar correos de '
    'recuperacion de contrasena y de bienvenida cuando un nuevo cliente se registra. La '
    'integracion ya esta programada con fallback a consola en modo desarrollo, asi que en '
    'produccion solo necesitas agregar la API key.'
))

story.append(heading2('4.1 Crear Cuenta'))
story.append(bullet('Ir a <b>resend.com</b> y crear cuenta'))
story.append(bullet('Agregar y verificar tu dominio <b>qaiross.app</b>'))
story.append(bullet('En DNS agregar los registros MX y TXT que Resend indica'))
story.append(bullet('Esperar la verificacion (puede tomar hasta 48 horas)'))

story.append(heading2('4.2 Obtener API Key'))
story.append(bullet('En API Keys, crear una nueva key con nombre "QAIROSS Production"'))
story.append(bullet('Guardar el valor como <b>RESEND_API_KEY</b>'))
story.append(bullet('Configurar EMAIL_FROM = <b>noreply@qaiross.app</b>'))

story.append(heading2('4.3 Alternativa: SendGrid'))
story.append(body(
    'Si prefieres SendGrid en lugar de Resend, necesitaras modificar el archivo '
    '<b>src/lib/email.ts</b> para usar el SDK de SendGrid en lugar de Resend. La logica de '
    'los templates HTML ya esta construida, solo cambiaria el proveedor de envio. SendGrid '
    'ofrece 100 emails gratis por dia, mientras que Resend ofrece 3,000 por mes en su plan gratuito.'
))

# ═══════════════════════════════════════════════════════════════════════════════
# 5. VERCEL
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('5. Paso 4: Desplegar en Vercel'))
story.append(body(
    'Vercel es la plataforma de hosting recomendada para Next.js. Ofrece deploy automatico '
    'desde GitHub, SSL gratuito, CDN global, funciones serverless para las rutas API y '
    'escalado automatico. El plan gratuito (Hobby) soporta hasta 100GB de ancho de banda '
    'y funciones serverless de 10 segundos, lo cual es suficiente para empezar a vender.'
))

story.append(heading2('5.1 Preparar el Repositorio'))
story.append(bullet('Crear un repositorio en GitHub (privado o publico)'))
story.append(bullet('Subir el codigo del proyecto:'))
story.append(code('git init\ngit add .\ngit commit -m "QAIROSS v1.0.0 - Production ready"\ngit remote add origin https://github.com/TU-USUARIO/kinec.git\ngit push -u origin main'))
story.append(spacer(4))
story.append(Paragraph('<b>Importante:</b> Asegurate de que el archivo <b>.gitignore</b> incluya '
    '.env, .env.local, .env.production, node_modules/, .next/, y prisma/*.db. '
    'NUNCA subas archivos .env a Git.', callout_style))

story.append(heading2('5.2 Importar en Vercel'))
story.append(bullet('Ir a <b>vercel.com</b> y crear cuenta con GitHub'))
story.append(bullet('Click en "Add New Project"'))
story.append(bullet('Seleccionar el repositorio de QAIROSS'))
story.append(bullet('En configuracion del proyecto:'))
story.append(bullet('Framework Preset: <b>Next.js</b> (se detecta automaticamente)'))
story.append(bullet('Build Command: <b>npm run vercel-build</b> (ya configurado en vercel.json)'))
story.append(bullet('Output Directory: <b>.next</b> (por defecto)'))
story.append(bullet('NO agregar variables de entorno aqui todavia (lo haremos en el paso 7)'))
story.append(bullet('Click en "Deploy" y esperar el primer build (2-5 minutos)'))

story.append(heading2('5.3 Plan de Vercel'))
story.append(make_table(
    ['Caracteristica', 'Hobby (Gratis)', 'Pro ($20/mes)'],
    [
        ['Ancho de banda', '100 GB/mes', '1 TB/mes'],
        ['Funciones serverless', '10 seg timeout', '60 seg timeout'],
        ['Builds concurrentes', '1', '3'],
        ['Deploy previews', 'Si', 'Si'],
        ['Dominios personalizados', 'Si', 'Si'],
        ['SSL', 'Si', 'Si'],
        ['Soporte', 'Comunidad', 'Prioritario'],
    ],
    [2.2*inch, 1.9*inch, 1.9*inch]
))
story.append(body(
    'El plan Hobby es suficiente para empezar a vender. Cuando superes los limites, '
    'puedes migrar a Pro con un click sin downtime.'
))

# ═══════════════════════════════════════════════════════════════════════════════
# 6. DOMINIO
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('6. Paso 5: Configurar Dominio Personalizado'))
story.append(body(
    'Para que la plataforma sea accesible en links.qaiross.app, necesitas configurar '
    'los registros DNS en tu proveedor de dominio y agregar el dominio en Vercel. Este '
    'proceso no genera downtime y se puede hacer en paralelo con la configuracion de Vercel.'
))

story.append(heading2('6.1 Agregar Dominio en Vercel'))
story.append(bullet('En el dashboard del proyecto, ve a Settings > Domains'))
story.append(bullet('Agregar <b>links.qaiross.app</b>'))
story.append(bullet('Vercel mostrara los registros DNS necesarios'))

story.append(heading2('6.2 Configurar DNS'))
story.append(body('En tu proveedor de DNS (Cloudflare, Namecheap, GoDaddy, etc.):'))

story.append(make_table(
    ['Tipo', 'Nombre', 'Valor', 'TTL'],
    [
        ['CNAME', 'links', 'cname.vercel-dns.com', '3600'],
    ],
    [1.0*inch, 1.0*inch, 2.5*inch, 1.0*inch]
))
story.append(spacer(8))
story.append(Paragraph('<b>Nota:</b> Si usas Cloudflare como proxy (naranja), los webhooks de Stripe '
    'pueden fallar. Desactiva el proxy (DNS only, gris) para el subdominio links.', callout_style))

story.append(heading2('6.3 Verificar SSL'))
story.append(bullet('Vercel genera automaticamente un certificado SSL gratuito'))
story.append(bullet('Esperar 5-10 minutos tras configurar DNS'))
story.append(bullet('Verificar que https://links.qaiross.app carga correctamente'))
story.append(bullet('Vercel redirige automaticamente HTTP a HTTPS'))

# ═══════════════════════════════════════════════════════════════════════════════
# 7. ENV VARS
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('7. Paso 6: Variables de Entorno en Vercel'))
story.append(body(
    'Las variables de entorno son el corazon de la configuracion de produccion. TODAS las '
    'variables deben configurarse en Vercel antes de hacer el deploy final. Se configuran en '
    'Settings > Environment Variables del proyecto en Vercel.'
))

story.append(heading2('7.1 Variables Obligatorias'))
story.append(make_table(
    ['Variable', 'Valor de Ejemplo', 'Descripcion'],
    [
        ['DATABASE_URL', 'postgresql://postgres.abc:pass@aws-0...pooler.supabase.com:6543/postgres', 'Conexion PostgreSQL (usar Pooler)'],
        ['NEXTAUTH_SECRET', '(generar con openssl rand -base64 32)', 'Secreto para firmar sesiones JWT'],
        ['NEXTAUTH_URL', 'https://links.qaiross.app', 'URL canonica para NextAuth'],
        ['NEXT_PUBLIC_APP_URL', 'https://links.qaiross.app', 'URL base de la app'],
        ['NEXT_PUBLIC_APP_NAME', 'QAIROSS', 'Nombre de la aplicacion'],
        ['STRIPE_SECRET_KEY', 'sk_live_...', 'Clave secreta de Stripe'],
        ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_live_...', 'Clave publica de Stripe'],
        ['STRIPE_WEBHOOK_SECRET', 'whsec_...', 'Secreto del webhook (paso 9)'],
        ['NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co', 'URL del proyecto Supabase'],
        ['SUPABASE_SERVICE_ROLE_KEY', 'eyJ...', 'Clave de servicio Supabase'],
        ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJ...', 'Clave anonima Supabase'],
        ['RESEND_API_KEY', 're_...', 'API key de Resend'],
        ['EMAIL_FROM', 'noreply@qaiross.app', 'Email remitente'],
    ],
    [2.2*inch, 2.0*inch, 2.0*inch]
))

story.append(heading2('7.2 Generar NEXTAUTH_SECRET'))
story.append(code('openssl rand -base64 32'))
story.append(body(
    'Ejecuta este comando en tu terminal y copia el resultado. Este secreto es critico para '
    'la seguridad de las sesiones. Si se compromete, todos los tokens JWT existentes quedan '
    'invalidados y los usuarios tendran que iniciar sesion nuevamente.'
))

story.append(heading2('7.3 Variables Opcionales'))
story.append(make_table(
    ['Variable', 'Descripcion', 'Requerida?'],
    [
        ['GOOGLE_MAPS_API_KEY', 'Para geocodificacion y mapas en ubicaciones', 'Solo si usas mapas'],
        ['NEXT_PUBLIC_SENTRY_DSN', 'Monitoreo de errores en frontend', 'Recomendada'],
        ['SENTRY_AUTH_TOKEN', 'Subir source maps a Sentry', 'Opcional'],
        ['ADMIN_PASSWORD_HASH', 'Hash bcrypt del super admin', 'Ver paso 8'],
    ],
    [2.0*inch, 2.8*inch, 1.4*inch]
))

story.append(heading2('7.4 Aplicar Variables y Redeploy'))
story.append(bullet('Despues de agregar todas las variables, ve a Deployments'))
story.append(bullet('Click en los tres puntos del ultimo deploy exitoso'))
story.append(bullet('Selecciona "Redeploy" para que las variables surtan efecto'))

# ═══════════════════════════════════════════════════════════════════════════════
# 8. MIGRACION + SEED
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('8. Paso 7: Migrar Base de Datos y Seed'))
story.append(body(
    'Una vez configurada la DATABASE_URL apuntando a Supabase, necesitas crear las tablas '
    'y poblar los datos iniciales (planes, super admin, configuracion de plataforma). '
    'Esto se hace desde tu maquina local usando los comandos de Prisma.'
))

story.append(heading2('8.1 Ejecutar Migraciones'))
story.append(body('Con la DATABASE_URL de Supabase configurada temporalmente en tu .env local:'))
story.append(code('npx prisma migrate deploy'))
story.append(body(
    'Este comando ejecuta todas las migraciones pendientes en orden. La migracion inicial '
    'crea las 19+ tablas del sistema (User, Client, Plan, Subscription, MiniSite, etc.) '
    'con todos los indices y relaciones necesarias. Si alguna migracion falla, Prisma '
    'detiene el proceso y muestra el error para correccion.'
))

story.append(heading2('8.2 Generar Hash del Super Admin'))
story.append(body('Antes de ejecutar el seed, genera el hash de tu contrasena de admin:'))
story.append(code('npx tsx -e "import {hashSync} from \'bcryptjs\'; console.log(hashSync(\'TU-CONTRASENA-SEGURA\', 12))"'))
story.append(body(
    'Copia el hash generado. Esta contrasena es para la cuenta super_admin que tendra acceso '
    'al panel de administracion completo en /admin. Elige una contrasena fuerte (12+ caracteres, '
    'mayusculas, minusculas, numeros y simbolos).'
))

story.append(heading2('8.3 Ejecutar Seed de Produccion'))
story.append(code('ADMIN_PASSWORD_HASH="$2a$12$..." npx tsx prisma/seed-prod.ts'))
story.append(body('Este script crea:'))
story.append(bullet('<b>4 planes</b>: Trial (gratuito, 30 dias), Basico ($9.99/mes), Pro ($24.99/mes), Premium ($49.99/mes)'))
story.append(bullet('<b>Super Admin</b>: admin@qaiross.app con tu hash de contrasena'))
story.append(bullet('<b>Platform Settings</b>: 16 configuraciones del sistema (nombre, colores, contacto, etc.)'))
story.append(bullet('<b>Platform Sections</b>: 6 secciones de la landing page (hero, beneficios, como funciona, precios, testimonios, FAQ)'))

story.append(Paragraph('<b>Importante:</b> El seed usa upsert, lo que significa que puedes '
    'ejecutarlo multiples veces sin duplicar datos. Si un registro ya existe, se actualiza '
    'en lugar de crearse uno nuevo.', callout_style))

# ═══════════════════════════════════════════════════════════════════════════════
# 9. WEBHOOKS
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('9. Paso 8: Configurar Webhooks de Stripe'))
story.append(body(
    'Los webhooks son la forma en que Stripe notifica a QAIROSS sobre eventos de pago en tiempo '
    'real: suscripciones activadas, pagos fallidos, cancelaciones, etc. Sin webhooks, la base '
    'de datos no se actualizaria cuando un cliente paga o cancela.'
))

story.append(heading2('9.1 Crear el Webhook'))
story.append(bullet('En el dashboard de Stripe, ve a Developers > Webhooks'))
story.append(bullet('Click en "Add endpoint"'))
story.append(bullet('Endpoint URL: <b>https://links.qaiross.app/api/stripe/webhook</b>'))
story.append(bullet('Eventos a escuchar (seleccionar manualmente):'))

story.append(make_table(
    ['Evento', 'Accion en QAIROSS'],
    [
        ['checkout.session.completed', 'Activar suscripcion tras pago exitoso'],
        ['invoice.paid', 'Reactivar cuenta si estaba bloqueada por pago fallido'],
        ['invoice.payment_failed', 'Marcar suscripcion como past_due'],
        ['customer.subscription.updated', 'Sincronizar estado de suscripcion'],
        ['customer.subscription.deleted', 'Marcar suscripcion como cancelada'],
    ],
    [2.5*inch, 3.5*inch]
))

story.append(heading2('9.2 Obtener Webhook Secret'))
story.append(bullet('Despues de crear el endpoint, click en "Reveal" junto a "Signing secret"'))
story.append(bullet('Copiar el valor <b>whsec_...</b>'))
story.append(bullet('Agregar como <b>STRIPE_WEBHOOK_SECRET</b> en las variables de Vercel'))
story.append(bullet('Redeploy para que el nuevo secreto surta efecto'))

story.append(Paragraph('<b>Critico:</b> Sin STRIPE_WEBHOOK_SECRET, los webhooks seran rechazados '
    'porque la firma no se puede verificar. Si ves errores 401 en los logs de Stripe, '
    'verifica que este secreto este configurado correctamente.', callout_style))

# ═══════════════════════════════════════════════════════════════════════════════
# 10. VERIFICACION
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('9. Paso 9: Verificacion Final y Go-Live'))
story.append(body(
    'Antes de abrir la plataforma al publico, realiza estas verificaciones criticas '
    'para asegurar que todo funciona correctamente. Cada punto debe pasar antes de '
    'dar el visto bueno para ventas.'
))

story.append(heading2('10.1 Checklist de Verificacion'))
story.append(make_table(
    ['Verificacion', 'Como Probar', 'Resultado Esperado'],
    [
        ['Landing carga', 'Visitar links.qaiross.app', 'Pagina completa con secciones'],
        ['Registro', 'Crear cuenta nueva', 'Cuenta creada, redirige a dashboard'],
        ['Login', 'Iniciar sesion', 'Redirige al dashboard del cliente'],
        ['Dashboard', 'Ver panel principal', 'Muestra datos del plan Trial'],
        ['Crear QAIROSS', 'Nuevo centro digital', 'Editor con preview movil'],
        ['Checkout', 'Subir de plan', 'Redirige a Stripe Checkout'],
        ['Webhook', 'Completar pago test', 'Suscripcion activada en BD'],
        ['Recuperar clave', 'Click "Olvide mi clave"', 'Email recibido'],
        ['Admin panel', 'Visitar /admin', 'Dashboard con estadisticas'],
        ['Centro digital', 'Visitar /[slug]', 'Mini web publica con QR'],
        ['Upload imagen', 'Subir logo/galeria', 'Imagen guardada en Supabase Storage'],
        ['API health', 'GET /api/health', '{"status":"ok"}'],
    ],
    [1.5*inch, 2.0*inch, 2.5*inch]
))

story.append(heading2('10.2 Prueba de Pago End-to-End'))
story.append(body(
    'Realiza una prueba completa de pago usando las tarjetas de prueba de Stripe antes de '
    'activar las claves de produccion. Usa la tarjeta 4242 4242 4242 4242 con cualquier '
    'fecha futura y CVC. Verifica que el webhook se reciba correctamente, que la suscripcion '
    'se active en la base de datos y que el dashboard del cliente muestre el plan actualizado.'
))

story.append(heading2('10.3 Go-Live Checklist'))
story.append(bullet('Cambiar STRIPE_SECRET_KEY de sk_test_ a sk_live_'))
story.append(bullet('Cambiar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY de pk_test_ a pk_live_'))
story.append(bullet('Crear webhook de produccion con URL https://links.qaiross.app'))
story.append(bullet('Verificar que el dominio esta verificado en Resend'))
story.append(bullet('Redeploy en Vercel para aplicar todos los cambios'))
story.append(bullet('Realizar un pago real de prueba con tarjeta propia'))
story.append(bullet('Verificar que el email de bienvenida llega correctamente'))

# ═══════════════════════════════════════════════════════════════════════════════
# 11. CHECKLIST
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('11. Checklist de Produccion'))
story.append(body(
    'Esta es la lista definitiva de todo lo que necesitas configurar antes de que QAIROSS '
    'este listo para recibir clientes reales. Marca cada item conforme lo completes.'
))

story.append(make_table(
    ['#', 'Tarea', 'Servicio', 'Estado'],
    [
        ['1', 'Crear proyecto Supabase', 'Supabase', 'Pendiente'],
        ['2', 'Configurar DATABASE_URL (Pooler)', 'Supabase', 'Pendiente'],
        ['3', 'Crear bucket "uploads"', 'Supabase', 'Pendiente'],
        ['4', 'Configurar politica de lectura publica', 'Supabase', 'Pendiente'],
        ['5', 'Crear cuenta de Stripe', 'Stripe', 'Pendiente'],
        ['6', 'Obtener claves API de Stripe', 'Stripe', 'Pendiente'],
        ['7', 'Crear productos y precios', 'Stripe', 'Pendiente'],
        ['8', 'Crear cuenta de Resend', 'Resend', 'Pendiente'],
        ['9', 'Verificar dominio en Resend', 'Resend', 'Pendiente'],
        ['10', 'Subir codigo a GitHub', 'GitHub', 'Pendiente'],
        ['11', 'Importar proyecto en Vercel', 'Vercel', 'Pendiente'],
        ['12', 'Configurar todas las env vars', 'Vercel', 'Pendiente'],
        ['13', 'Agregar dominio personalizado', 'Vercel', 'Pendiente'],
        ['14', 'Configurar DNS (CNAME)', 'DNS', 'Pendiente'],
        ['15', 'Esperar verificacion SSL', 'Vercel', 'Pendiente'],
        ['16', 'Ejecutar prisma migrate deploy', 'Local', 'Pendiente'],
        ['17', 'Ejecutar seed de produccion', 'Local', 'Pendiente'],
        ['18', 'Crear webhook de Stripe', 'Stripe', 'Pendiente'],
        ['19', 'Prueba end-to-end de pago', 'Stripe', 'Pendiente'],
        ['20', 'Cambiar a claves live de Stripe', 'Stripe', 'Pendiente'],
        ['21', 'Redeploy final en Vercel', 'Vercel', 'Pendiente'],
        ['22', 'Verificacion completa go-live', 'Todos', 'Pendiente'],
    ],
    [0.4*inch, 2.8*inch, 1.2*inch, 1.0*inch]
))

# ═══════════════════════════════════════════════════════════════════════════════
# 12. TROUBLESHOOTING
# ═══════════════════════════════════════════════════════════════════════════════
story.append(heading1('12. Solucion de Problemas'))
story.append(body(
    'A continuacion se presentan los problemas mas comunes durante el despliegue y sus '
    'soluciones. La mayoria se deben a configuracion incorrecta de variables de entorno '
    'o problemas de conectividad con los servicios externos.'
))

story.append(heading2('Error: "Prisma Client could not connect"'))
story.append(body(
    'Este error ocurre cuando la DATABASE_URL es incorrecta o la conexion esta bloqueada. '
    'Verifica que estes usando la conexion Pooler (puerto 6543, no 5432) y que la contrasena '
    'sea correcta. Tambien asegurate de que el proyecto de Supabase no este pausado (los proyectos '
    'gratuitos se pausan despues de 7 dias de inactividad).'
))

story.append(heading2('Error: "Stripe no esta configurado"'))
story.append(body(
    'Si ves este warning en los logs, significa que STRIPE_SECRET_KEY no esta configurada o '
    'contiene la palabra "placeholder". Ve a las variables de entorno en Vercel y asegurate de '
    'que el valor sea una clave valida de Stripe que comience con sk_test_ o sk_live_.'
))

story.append(heading2('Error: Webhook devuelve 401'))
story.append(body(
    'El endpoint de webhook verifica la firma del evento usando STRIPE_WEBHOOK_SECRET. Si este '
    'secreto no esta configurado o no coincide con el del endpoint en Stripe, se devuelve 401. '
    'Regenera el secreto en el dashboard de Stripe y actualiza la variable en Vercel.'
))

story.append(heading2('Error: "Email no enviado"'))
story.append(body(
    'Si los emails no se envian, verifica: (1) RESEND_API_KEY esta configurada correctamente, '
    '(2) el dominio qaiross.app esta verificado en Resend, (3) EMAIL_FROM usa un dominio '
    'verificado. Si estas en modo desarrollo, los emails se loguean en consola en lugar de enviarse.'
))

story.append(heading2('Error: "Imagen no sube"'))
story.append(body(
    'Si las imagenes no se suben, verifica: (1) El bucket "uploads" existe en Supabase, '
    '(2) NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estan configuradas, '
    '(3) La politica de lectura publica esta configurada en el bucket. Si Supabase no esta '
    'configurado, el sistema hace fallback a filesystem local (no funciona en Vercel).'
))

story.append(heading2('Error: Build falla en Vercel'))
story.append(body(
    'Si el build falla, revisa los logs de Vercel. Las causas mas comunes son: (1) TypeScript '
    'errores que no aparecieron en desarrollo local, (2) Variables de entorno faltantes que '
    'causan errores de compilacion, (3) Dependencias que no se instalan correctamente. Asegurate '
    'de que el build funcione localmente con "npm run build" antes de desplegar.'
))

story.append(heading2('Rendimiento: Pagina de admin lenta'))
story.append(body(
    'La pagina de administracion (/admin) carga muchas estadisticas y datos en paralelo. '
    'Si es lenta en produccion, considera: (1) Agregar caching con TanStack Query en el '
    'cliente, (2) Implementar paginacion en las tablas de clientes y ordenes, (3) Usar '
    'React Server Components para las consultas pesadas. Vercel tiene mejor manejo de '
    'memoria que el entorno de desarrollo, asi que este problema suele ser menos severo '
    'en produccion.'
))

# ─── Build the PDF ───────────────────────────────────────────────────────────
doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
print(f'PDF generado: {output_path}')
print(f'Tamano: {os.path.getsize(output_path):,} bytes')
