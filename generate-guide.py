#!/usr/bin/env python3
"""Generate Kingnect Production Setup Guide PDF"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# ── Register fonts ──
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ── Colors (from palette) ──
ACCENT       = colors.HexColor('#D4A849')
TEXT_PRIMARY  = colors.HexColor('#23221f')
TEXT_MUTED    = colors.HexColor('#837f77')
BG_SURFACE   = colors.HexColor('#e7e5e1')
BG_PAGE      = colors.HexColor('#f1f0ef')
KINGNECT_GOLD = colors.HexColor('#D4A849')

# ── Page setup ──
PAGE_W, PAGE_H = A4
LEFT_M = 1.0 * inch
RIGHT_M = 1.0 * inch
TOP_M = 0.8 * inch
BOT_M = 0.8 * inch
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ── Styles ──
styles = getSampleStyleSheet()

h1_style = ParagraphStyle(
    'KingH1', fontName='Carlito', fontSize=20, leading=28,
    spaceBefore=18, spaceAfter=10, textColor=ACCENT, alignment=TA_LEFT
)
h2_style = ParagraphStyle(
    'KingH2', fontName='Carlito', fontSize=15, leading=22,
    spaceBefore=14, spaceAfter=8, textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
h3_style = ParagraphStyle(
    'KingH3', fontName='Carlito', fontSize=12, leading=18,
    spaceBefore=10, spaceAfter=6, textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
body_style = ParagraphStyle(
    'KingBody', fontName='Carlito', fontSize=10.5, leading=18,
    spaceBefore=2, spaceAfter=6, textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY
)
code_style = ParagraphStyle(
    'KingCode', fontName='DejaVuSans', fontSize=9, leading=14,
    spaceBefore=2, spaceAfter=2, textColor=colors.HexColor('#1a1a2e'),
    backColor=colors.HexColor('#f5f5f5'), leftIndent=12, rightIndent=12,
    borderPadding=4, alignment=TA_LEFT
)
bullet_style = ParagraphStyle(
    'KingBullet', fontName='Carlito', fontSize=10.5, leading=18,
    spaceBefore=1, spaceAfter=3, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    leftIndent=20, bulletIndent=8
)
table_header_style = ParagraphStyle(
    'KingTH', fontName='Carlito', fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER
)
table_cell_style = ParagraphStyle(
    'KingTC', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
table_cell_center = ParagraphStyle(
    'KingTCC', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
caption_style = ParagraphStyle(
    'KingCaption', fontName='Carlito', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=12
)

# ── Helper functions ──
def h1(text):
    return Paragraph(f'<b>{text}</b>', h1_style)

def h2(text):
    return Paragraph(f'<b>{text}</b>', h2_style)

def h3(text):
    return Paragraph(f'<b>{text}</b>', h3_style)

def p(text):
    return Paragraph(text, body_style)

def code(text):
    return Paragraph(text, code_style)

def bullet(text):
    return Paragraph(f'<bullet>&bull;</bullet> {text}', bullet_style)

def make_table(headers, rows, col_widths=None):
    if col_widths is None:
        col_widths = [CONTENT_W / len(headers)] * len(headers)
    else:
        total = sum(col_widths)
        col_widths = [w / total * CONTENT_W for w in col_widths]
    
    data = [[Paragraph(f'<b>{h}</b>', table_header_style) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), table_cell_style) for c in row])
    
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else BG_SURFACE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ── Build document ──
output_path = '/home/z/my-project/download/Kingnect-Guia-Produccion.pdf'
os.makedirs(os.path.dirname(output_path), exist_ok=True)

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOT_M,
    title='Kingnect - Guia de Configuracion para Produccion',
    author='King Designs',
    creator='Z.ai'
)

story = []

# ─────────────────────────────────────────────────────────
# COVER / TITLE
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 80))
story.append(Paragraph('<b>KINGNECT</b>', ParagraphStyle(
    'CoverTitle', fontName='Carlito', fontSize=36, leading=44,
    textColor=ACCENT, alignment=TA_CENTER
)))
story.append(Spacer(1, 12))
story.append(Paragraph('Guia de Configuracion para Produccion', ParagraphStyle(
    'CoverSub', fontName='Carlito', fontSize=18, leading=26,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)))
story.append(Spacer(1, 24))
story.append(Paragraph('by King Designs', ParagraphStyle(
    'CoverMeta', fontName='Carlito', fontSize=12, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(Spacer(1, 8))
story.append(Paragraph('Mayo 2026', ParagraphStyle(
    'CoverDate', fontName='Carlito', fontSize=11, leading=14,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(Spacer(1, 60))

# Gold line separator
line_table = Table([['']], colWidths=[CONTENT_W * 0.4], rowHeights=[2])
line_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), ACCENT),
    ('LINEBELOW', (0, 0), (-1, -1), 0, colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
]))
story.append(line_table)

story.append(Spacer(1, 30))
story.append(Paragraph(
    'Esta guia te acompana paso a paso para configurar todos los servicios necesarios '
    'para llevar tu plataforma Kingnect a produccion. Cada seccion incluye instrucciones '
    'detalladas, comandos exactos y verificaciones para asegurar que todo funcione correctamente.',
    ParagraphStyle('CoverDesc', fontName='Carlito', fontSize=11, leading=18,
                   textColor=TEXT_MUTED, alignment=TA_CENTER)
))

story.append(PageBreak())

# ─────────────────────────────────────────────────────────
# TABLE OF CONTENTS (manual - simple)
# ─────────────────────────────────────────────────────────
story.append(h1('Contenido'))
story.append(Spacer(1, 12))

toc_items = [
    ('1', 'Credenciales de Prueba'),
    ('2', 'Configurar Stripe (Pagos)'),
    ('3', 'Configurar Email con Resend'),
    ('4', 'Migrar Uploads a Supabase Storage'),
    ('5', 'Iconos PWA'),
    ('6', 'Conectar Dominio links.kingnect.app'),
    ('7', 'Analytics Reales'),
    ('8', 'Dashboard con Datos Reales'),
    ('9', 'Testing E2E con Playwright'),
    ('10', 'Monitoreo y Logs en Produccion'),
    ('11', 'Variables de Entorno para Produccion'),
    ('12', 'Checklist de Despliegue'),
]

for num, title in toc_items:
    story.append(Paragraph(
        f'<b>{num}.</b>  {title}',
        ParagraphStyle('TOCItem', fontName='Carlito', fontSize=12, leading=22,
                       textColor=TEXT_PRIMARY, leftIndent=10)
    ))

story.append(PageBreak())

# ─────────────────────────────────────────────────────────
# 1. CREDENCIALES DE PRUEBA
# ─────────────────────────────────────────────────────────
story.append(h1('1. Credenciales de Prueba'))
story.append(Spacer(1, 6))
story.append(p(
    'Para desarrollo y pruebas, estas son las credenciales que vienen precargadas '
    'en la base de datos SQLite del proyecto. El usuario administrador tiene acceso '
    'completo al panel de admin, mientras que el usuario demo tiene acceso al dashboard '
    'de cliente con un plan Trial activo.'
))

story.append(Spacer(1, 10))
story.append(make_table(
    ['Rol', 'Email', 'Contrasena', 'Acceso'],
    [
        ['Super Admin', 'admin@kingnect.app', 'Admin123!', '/admin'],
        ['Cliente Demo', 'demo@kingnect.app', 'Demo123!', '/dashboard'],
    ],
    [1, 2, 1.2, 1]
))
story.append(Spacer(1, 4))
story.append(Paragraph('<b>Nota:</b> Cambia estas contrasenas en produccion.', caption_style))

story.append(Spacer(1, 10))
story.append(p(
    'Para crear un nuevo usuario de prueba, puedes usar el formulario de registro en '
    '/register. Al registrarte se crea automaticamente un usuario con rol de cliente, '
    'un registro de negocio, una suscripcion Trial de 30 dias y un Kinec vacio listo para editar.'
))

# ─────────────────────────────────────────────────────────
# 2. STRIPE
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('2. Configurar Stripe (Pagos)'))
story.append(Spacer(1, 6))
story.append(p(
    'Stripe maneja todos los pagos de suscripcion de Kingnect. El codigo ya esta implementado '
    'con soporte completo para checkout, portal de cliente, webhooks y gestion de suscripciones. '
    'Solo necesitas configurar las claves reales y los webhooks para que funcione en produccion.'
))

story.append(h2('2.1 Obtener Claves de Stripe'))
story.append(p(
    'Ve a <b>https://dashboard.stripe.com</b> y crea una cuenta. Una vez dentro, navega a '
    'Developers &gt; API Keys. Ahi encontraras tu clave publica y tu clave secreta. Para '
    'produccion, asegurate de usar las claves en modo "Live" (no "Test"). Copia estas claves '
    'y actualiza tu archivo .env con los valores reales.'
))
story.append(Spacer(1, 4))
story.append(code(
    'STRIPE_SECRET_KEY=sk_live_...<br/>'
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...<br/>'
    'STRIPE_WEBHOOK_SECRET=whsec_...'
))

story.append(h2('2.2 Configurar Webhooks'))
story.append(p(
    'Los webhooks son esenciales para que Stripe notifique a tu aplicacion cuando ocurren '
    'eventos como pagos exitosos, fallos de pago, cancelaciones, etc. Sin webhooks, las '
    'suscripciones no se actualizaran automaticamente en tu base de datos.'
))
story.append(Spacer(1, 4))
story.append(bullet('Ve a Developers &gt; Webhooks en el dashboard de Stripe'))
story.append(bullet('Haz clic en "Add endpoint"'))
story.append(bullet('URL del endpoint: <b>https://links.kingnect.app/api/stripe/webhook</b>'))
story.append(bullet('Eventos a escuchar:'))
indent_bullet_style = ParagraphStyle(
    'KingIndentBullet', fontName='Carlito', fontSize=10.5, leading=18,
    spaceBefore=1, spaceAfter=3, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    leftIndent=40, bulletIndent=28
)
story.append(Paragraph('<bullet>&bull;</bullet> checkout.session.completed', indent_bullet_style))
story.append(Paragraph('<bullet>&bull;</bullet> invoice.payment_failed', indent_bullet_style))
story.append(Paragraph('<bullet>&bull;</bullet> invoice.paid', indent_bullet_style))
story.append(Paragraph('<bullet>&bull;</bullet> customer.subscription.deleted', indent_bullet_style))
story.append(Paragraph('<bullet>&bull;</bullet> customer.subscription.updated', indent_bullet_style))
story.append(Spacer(1, 4))
story.append(p(
    'Despues de crear el endpoint, Stripe mostrara un "Signing secret". Copia ese valor '
    'y ponlo en STRIPE_WEBHOOK_SECRET en tu .env.'
))

story.append(h2('2.3 Crear Productos y Precios en Stripe'))
story.append(p(
    'El codigo de Kingnect crea automaticamente productos y precios en Stripe la primera vez '
    'que un cliente intenta suscribirse a un plan (via la funcion getOrCreatePrice). Sin embargo, '
    'puedes crearlos manualmente en el dashboard de Stripe para tener mas control sobre los '
    'nombres, descripciones y metadatos. Los planes configurados en la base de datos son:'
))

story.append(Spacer(1, 6))
story.append(make_table(
    ['Plan', 'Precio/mes', 'Stripe Product Name'],
    [
        ['Trial', '$0.00', 'Kingnect Trial'],
        ['Basico', '$9.99', 'Kingnect Basico'],
        ['Pro', '$24.99', 'Kingnect Pro'],
        ['Premium', '$49.99', 'Kingnect Premium'],
    ],
    [1, 1, 2]
))

story.append(h2('2.4 Verificacion'))
story.append(bullet('Ejecuta <b>curl https://links.kingnect.app/api/health</b> y verifica que stripe diga "configured"'))
story.append(bullet('Haz una prueba de checkout con una tarjeta de prueba de Stripe (4242 4242 4242 4242)'))
story.append(bullet('Verifica que el webhook llega correctamente revisando el dashboard de Stripe'))

# ─────────────────────────────────────────────────────────
# 3. EMAIL CON RESEND
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('3. Configurar Email con Resend'))
story.append(Spacer(1, 6))
story.append(p(
    'Kingnect usa <b>Resend</b> como proveedor de email transaccional. Resend es moderno, '
    'rapido, con una API limpia y un generoso tier gratuito (100 emails/dia). Se encarga de '
    'enviar correos de recuperacion de contrasena, bienvenida y notificaciones. Si Resend no '
    'esta configurado, los emails se loguean en consola (modo desarrollo).'
))

story.append(h2('3.1 Crear Cuenta en Resend'))
story.append(bullet('Ve a <b>https://resend.com</b> y crea una cuenta gratuita'))
story.append(bullet('Verifica tu dominio (recomendado: kingnect.app) en Domain Settings'))
story.append(bullet('Genera una API Key en API Keys &gt; Create API Key'))
story.append(bullet('Copia la API Key y actualiza tu .env:'))
story.append(Spacer(1, 4))
story.append(code(
    'RESEND_API_KEY=re_xxxxxxxxxxxx<br/>'
    'EMAIL_FROM=no-reply@kingnect.app'
))

story.append(h2('3.2 Verificar Dominio en Resend'))
story.append(p(
    'Para que los correos lleguen a la bandeja de entrada (y no a spam), necesitas verificar '
    'tu dominio en Resend. Esto implica agregar registros DNS que Resend te proporciona. '
    'Los registros tipicamente incluyen SPF, DKIM y DMARC. Sin verificacion de dominio, '
    'Resend solo permite enviar a tu propio email durante el modo de prueba.'
))
story.append(Spacer(1, 4))
story.append(bullet('En Resend, ve a Domains &gt; Add Domain'))
story.append(bullet('Ingresa kingnect.app'))
story.append(bullet('Agrega los registros DNS que Resend te muestra en tu proveedor DNS'))
story.append(bullet('Espera la verificacion (puede tardar hasta 48 horas)'))

story.append(h2('3.3 Emails Implementados'))
story.append(p(
    'El sistema de email ya esta integrado en la plataforma con los siguientes correos transaccionales:'
))
story.append(bullet('<b>Recuperacion de contrasena:</b> Se envia cuando un usuario solicita restablecer su contrasena en /forgot-password. Incluye un enlace seguro que expira en 1 hora.'))
story.append(bullet('<b>Bienvenida:</b> Se envia automaticamente cuando un nuevo usuario se registra. Incluye un enlace al dashboard.'))
story.append(Spacer(1, 4))
story.append(p(
    'Ambos correos usan plantillas HTML profesionales con el branding de Kingnect (color dorado #D4A849) '
    'y son responsive para verse bien en moviles.'
))

story.append(h2('3.4 Flujo de Recuperacion de Contrasena'))
story.append(p(
    'El flujo completo de recuperacion de contrasena funciona asi: el usuario visita /forgot-password '
    'e ingresa su email. El servidor crea un token de verificacion unico con expiracion de 1 hora y '
    'envia un correo con un enlace a /reset-password?token=TOKEN. Al hacer clic, el usuario ve un '
    'formulario para ingresar su nueva contrasena. El servidor valida el token y actualiza la contrasena.'
))

# ─────────────────────────────────────────────────────────
# 4. SUPABASE STORAGE
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('4. Migrar Uploads a Supabase Storage'))
story.append(Spacer(1, 6))
story.append(p(
    'Actualmente las imagenes subidas se guardan en el sistema de archivos local (public/uploads/). '
    'Esto funciona en desarrollo pero es problematico en produccion porque los archivos se pierden '
    'con cada redeploy. La solucion es usar <b>Supabase Storage</b>, que ya esta integrado en el '
    'codigo y se activa automaticamente cuando configuras las variables de entorno.'
))

story.append(h2('4.1 Configurar Supabase'))
story.append(bullet('Ve a <b>https://supabase.com</b> y crea un proyecto'))
story.append(bullet('En tu proyecto, ve a Storage y crea un bucket llamado <b>uploads</b>'))
story.append(bullet('Configura el bucket como publico (para que las imagenes sean accesibles via URL)'))
story.append(bullet('Ve a Settings &gt; API y copia la URL del proyecto y la Service Role Key'))
story.append(bullet('Actualiza tu .env:'))
story.append(Spacer(1, 4))
story.append(code(
    'NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co<br/>'
    'SUPABASE_SERVICE_ROLE_KEY=eyJhbG...<br/>'
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...'
))

story.append(h2('4.2 Politicas de Seguridad del Bucket'))
story.append(p(
    'Para que las subidas funcionen correctamente desde el servidor (usando la Service Role Key), '
    'necesitas configurar las politicas RLS (Row Level Security) en el bucket. La Service Role Key '
    'borra las restricciones RLS, lo cual es correcto para subidas desde el backend. Sin embargo, '
    'si quieres que el navegador pueda acceder directamente a los archivos, el bucket debe ser publico.'
))
story.append(Spacer(1, 4))
story.append(bullet('Ve a Storage &gt; uploads &gt; Policies'))
story.append(bullet('Agrega una politica que permita lectura publica (SELECT para anon)'))
story.append(bullet('Las subidas se manejan desde el backend con la Service Role Key, por lo que no necesitas politicas de escritura para usuarios anonimos'))

story.append(h2('4.3 Como Funciona la Migracion'))
story.append(p(
    'El codigo en <b>src/lib/storage.ts</b> implementa una capa de abstraccion que detecta '
    'automaticamente si Supabase esta configurado. Si las variables de entorno contienen valores '
    'reales, las subidas van a Supabase Storage. Si no, caen al sistema de archivos local. '
    'Esto significa que no necesitas cambiar nada en tu codigo al migrar; solo configura las '
    'variables de entorno y las nuevas subidas iran a Supabase automaticamente. Para migrar '
    'archivos existentes, puedes subirlos manualmente al bucket de Supabase y actualizar las '
    'URLs en la base de datos.'
))

# ─────────────────────────────────────────────────────────
# 5. ICONOS PWA
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('5. Iconos PWA'))
story.append(Spacer(1, 6))
story.append(p(
    'Los iconos PWA ya estan generados y configurados en el proyecto. Se encuentran en '
    'public/icons/ e incluyen todos los tamanos necesarios para diferentes dispositivos y '
    'contextos de uso. El manifest.webmanifest ya referencia estos iconos correctamente.'
))

story.append(Spacer(1, 6))
story.append(make_table(
    ['Archivo', 'Tamano', 'Uso'],
    [
        ['icon-192x192.png', '192x192', 'PWA install prompt, splash screen'],
        ['icon-512x512.png', '512x512', 'PWA splash screen, store listing'],
        ['apple-touch-icon.png', '180x180', 'iOS home screen icon'],
        ['favicon-32x32.png', '32x32', 'Browser tab favicon'],
        ['favicon-16x16.png', '16x16', 'Browser tab favicon (small)'],
    ],
    [2, 1, 2.5]
))

story.append(Spacer(1, 6))
story.append(p(
    'Si necesitas actualizar el icono (por ejemplo, si cambias el logo de Kingnect), simplemente '
    'reemplaza el archivo icon-source.png en public/icons/ y ejecuta el script de redimensionamiento '
    'que usa la libreria sharp para generar todos los tamanos automaticamente.'
))

# ─────────────────────────────────────────────────────────
# 6. DOMINIO
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('6. Conectar Dominio links.kingnect.app'))
story.append(Spacer(1, 6))
story.append(p(
    'Para que tu plataforma sea accesible en links.kingnect.app, necesitas configurar '
    'los registros DNS y conectar el dominio en Vercel. Este proceso tiene dos partes: '
    'la configuracion DNS en tu proveedor de dominios y la configuracion en Vercel.'
))

story.append(h2('6.1 Configuracion DNS'))
story.append(p(
    'En tu proveedor DNS (donde compraste kingnect.app), agrega los siguientes registros:'
))
story.append(Spacer(1, 6))
story.append(make_table(
    ['Tipo', 'Nombre', 'Valor', 'TTL'],
    [
        ['CNAME', 'links', 'cname.vercel-dns.com', '3600'],
    ],
    [1, 1.5, 2.5, 0.8]
))
story.append(Spacer(1, 6))
story.append(p(
    'El registro CNAME apunta el subdominio "links" a Vercel. Si tu proveedor DNS no soporta '
    'CNAME flattening (como GoDaddy), puede que necesites usar un registro A en su lugar. '
    'Vercel te proporcionara las IPs correctas al agregar el dominio.'
))

story.append(h2('6.2 Configurar en Vercel'))
story.append(bullet('Ve a tu proyecto en <b>https://vercel.com</b>'))
story.append(bullet('Settings &gt; Domains &gt; Add'))
story.append(bullet('Ingresa <b>links.kingnect.app</b>'))
story.append(bullet('Vercel verificara el registro DNS (puede tardar hasta 48 horas)'))
story.append(bullet('Una vez verificado, Vercel emitira automaticamente un certificado SSL'))

story.append(h2('6.3 Actualizar Variables de Entorno'))
story.append(p(
    'Despues de configurar el dominio, actualiza las siguientes variables en tu .env y en '
    'las variables de entorno de Vercel para que las URLs se generen correctamente:'
))
story.append(Spacer(1, 4))
story.append(code(
    'NEXT_PUBLIC_APP_URL=https://links.kingnect.app<br/>'
    'NEXTAUTH_URL=https://links.kingnect.app'
))

story.append(h2('6.4 Verificacion'))
story.append(bullet('Visita https://links.kingnect.app y verifica que carga la landing page'))
story.append(bullet('Verifica que el certificado SSL es valido (candado verde en el navegador)'))
story.append(bullet('Prueba el login y la navegacion completa del sitio'))
story.append(bullet('Verifica que los Kinecs publicos cargan en https://links.kingnect.app/tu-slug'))

# ─────────────────────────────────────────────────────────
# 7. ANALYTICS
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('7. Analytics Reales'))
story.append(Spacer(1, 6))
story.append(p(
    'El sistema de analytics ya esta implementado y funcionando. Cada vez que un visitante '
    've un Kinec, hace clic en WhatsApp, sigue un link de redes sociales o hace un pedido, '
    'se registra un evento en la base de datos. El dashboard del cliente muestra estas '
    'estadisticas en tiempo real usando TanStack Query para obtener los datos del API.'
))

story.append(h2('7.1 Eventos Rastreados'))
story.append(Spacer(1, 6))
story.append(make_table(
    ['Evento', 'Descripcion', 'Donde se Rastrea'],
    [
        ['view', 'Vista de pagina del Kinec', 'Server-side en /[slug]'],
        ['click_whatsapp', 'Clic en boton WhatsApp', 'Client-side en minisite'],
        ['click_link', 'Clic en redes/links/custom', 'Client-side en minisite'],
        ['order_created', 'Pedido creado', 'Server-side en /api/orders'],
        ['qr_scan', 'Escaneo de QR', 'Client-side en minisite'],
    ],
    [1.3, 2, 1.8]
))

story.append(h2('7.2 API de Analytics'))
story.append(p(
    'El endpoint <b>GET /api/analytics?siteId=ID</b> devuelve estadisticas de los ultimos '
    '30 dias incluyendo: total de visitas, clics en WhatsApp, pedidos recibidos, y un desglose '
    'diario con vistas, clics y pedidos por dia. Este endpoint requiere autenticacion y verifica '
    'que el sitio pertenezca al usuario autenticado.'
))

story.append(h2('7.3 Analytics Externos (Opcional)'))
story.append(p(
    'Si deseas conectar un servicio de analytics externo como Google Analytics, Plausible o '
    'PostHog, puedes agregar el script de tracking en el layout principal. Para Plausible '
    '(recomendado por su enfoque en la privacidad), solo necesitas agregar el script en '
    'src/app/layout.tsx dentro del tag head de los metadatos.'
))

# ─────────────────────────────────────────────────────────
# 8. DASHBOARD DATOS REALES
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('8. Dashboard con Datos Reales'))
story.append(Spacer(1, 6))
story.append(p(
    'El dashboard del cliente ya esta conectado a datos reales de la API. Las estadisticas '
    'se obtienen del endpoint de analytics, los pedidos se cargan desde /api/orders, y los '
    'botones de facturacion llaman directamente a las APIs de Stripe para crear sesiones de '
    'checkout y portal de cliente. Ya no hay datos de placeholder ni funciones simuladas.'
))

story.append(h2('8.1 Funciones Conectadas'))
story.append(Spacer(1, 6))
story.append(make_table(
    ['Funcion', 'API', 'Estado'],
    [
        ['Estadisticas (visitas, clics, pedidos)', 'GET /api/analytics', 'Conectado'],
        ['Pedidos recientes', 'GET /api/orders', 'Conectado'],
        ['Cambiar estado de pedido', 'PUT /api/orders', 'Conectado'],
        ['Cambiar plan (checkout)', 'POST /api/stripe/create-checkout', 'Conectado'],
        ['Gestionar suscripcion', 'POST /api/stripe/create-portal', 'Conectado'],
        ['Reactivar cuenta', 'POST /api/stripe/create-portal', 'Conectado'],
    ],
    [2.2, 2.2, 1]
))

story.append(Spacer(1, 6))
story.append(p(
    'Todas las llamadas a la API usan TanStack Query con manejo de estados de carga '
    '(skeletons), errores (toast messages) y revalidacion automatica de datos. Cuando '
    'Stripe no esta configurado, los botones de facturacion muestran un mensaje informativo '
    'en lugar de fallar silenciosamente.'
))

# ─────────────────────────────────────────────────────────
# 9. TESTING E2E
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('9. Testing E2E con Playwright'))
story.append(Spacer(1, 6))
story.append(p(
    'Los tests E2E estan configurados con Playwright y cubren los flujos criticos de la '
    'plataforma. Los tests se encuentran en el directorio /tests y se pueden ejecutar con '
    'los comandos configurados en package.json. Playwright proporciona una forma robusta de '
    'verificar que la aplicacion funciona correctamente de extremo a extremo.'
))

story.append(h2('9.1 Comandos de Testing'))
story.append(Spacer(1, 4))
story.append(code(
    'npm run test:e2e          # Ejecutar todos los tests<br/>'
    'npm run test:e2e:headed   # Ejecutar con navegador visible<br/>'
    'npm run test:e2e:ui       # Interfaz visual de Playwright'
))

story.append(h2('9.2 Tests Disponibles'))
story.append(Spacer(1, 6))
story.append(make_table(
    ['Archivo', 'Tests', 'Cubierto'],
    [
        ['landing.spec.ts', '5 tests', 'Titulo, navbar, hero, pricing, navegacion'],
        ['auth.spec.ts', '4 tests', 'Login, registro, credenciales invalidas'],
        ['dashboard.spec.ts', '3 tests', 'Dashboard, QR, estado del plan'],
        ['api-health.spec.ts', '2 tests', 'Health endpoint, status ok'],
    ],
    [2, 1, 2.5]
))

story.append(h2('9.3 Agregar Mas Tests'))
story.append(p(
    'Para agregar mas tests, crea archivos .spec.ts en el directorio /tests. Sigue el patron '
    'de los tests existentes: usa test.describe() para agrupar tests relacionados y test() '
    'para cada caso individual. Puedes usar page.goto() para navegar, page.locator() para '
    'encontrar elementos y expect() para hacer aserciones. Playwright tambien soporta '
    'fixtures para reutilizar configuracion como sesiones de usuario autenticadas.'
))

# ─────────────────────────────────────────────────────────
# 10. MONITOREO
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('10. Monitoreo y Logs en Produccion'))
story.append(Spacer(1, 6))
story.append(p(
    'El sistema de monitoreo ya esta implementado con Sentry para errores, un endpoint de '
    'health check para monitores de uptime, y un sistema de logging estructurado para '
    'agregacion de logs. Solo necesitas configurar las credenciales de Sentry para activar '
    'el monitoreo de errores en produccion.'
))

story.append(h2('10.1 Configurar Sentry'))
story.append(bullet('Crea una cuenta en <b>https://sentry.io</b>'))
story.append(bullet('Crea un nuevo proyecto Next.js'))
story.append(bullet('Copia el DSN y actualiza tu .env:'))
story.append(Spacer(1, 4))
story.append(code(
    'NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx<br/>'
    'SENTRY_AUTH_TOKEN=sntryu_xxxxx<br/>'
    'SENTRY_ORG=tu-org<br/>'
    'SENTRY_PROJECT=kingnect'
))

story.append(Spacer(1, 6))
story.append(p(
    'Sentry capturara automaticamente todos los errores no manejados en el frontend y backend. '
    'Los errores se agrupan por tipo y muestran el stack trace completo, el navegador del '
    'usuario y el contexto de la solicitud. La configuracion incluye un sample rate del 10% '
    'para transacciones de rendimiento y session replays solo en caso de error.'
))

story.append(h2('10.2 Health Check Endpoint'))
story.append(p(
    'El endpoint <b>GET /api/health</b> devuelve el estado de todos los servicios criticos. '
    'Puedes usar este endpoint con servicios de monitoreo de uptime como UptimeRobot, Pingdom '
    'o Better Stack. El endpoint no requiere autenticacion y devuelve un JSON con el estado '
    'individual de cada servicio: base de datos, Stripe, email y almacenamiento.'
))
story.append(Spacer(1, 4))
story.append(bullet('Configura un monitor de uptime que haga GET a https://links.kingnect.app/api/health cada 5 minutos'))
story.append(bullet('Configura una alerta cuando el endpoint devuelva un status diferente a 200'))
story.append(bullet('El endpoint devuelve 503 si la base de datos no responde'))

story.append(h2('10.3 Logging Estructurado'))
story.append(p(
    'El modulo <b>src/lib/logger.ts</b> proporciona un sistema de logging estructurado. En '
    'desarrollo, los logs se muestran con formato y colores en la consola. En produccion, '
    'cada log se emite como una linea JSON para facilitar la agregacion con servicios como '
    'Datadog, CloudWatch Logs o Logflare. El logger soporta contexto persistente, niveles '
    '(info, warn, error, debug) y se puede usar en cualquier parte de la aplicacion.'
))

# ─────────────────────────────────────────────────────────
# 11. VARIABLES DE ENTORNO
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('11. Variables de Entorno para Produccion'))
story.append(Spacer(1, 6))
story.append(p(
    'A continuacion se muestra la lista completa de variables de entorno necesarias para '
    'produccion, con descripciones y valores de ejemplo. Nunca compartas las claves reales '
    'y siempre usa el panel de Vercel o un gestor de secretos para almacenarlas de forma segura.'
))

story.append(Spacer(1, 8))
story.append(make_table(
    ['Variable', 'Descripcion', 'Ejemplo'],
    [
        ['DATABASE_URL', 'URL de conexion a BD', 'postgresql://user:pass@host/db'],
        ['NEXT_PUBLIC_APP_NAME', 'Nombre de la app', 'Kingnect'],
        ['NEXT_PUBLIC_APP_URL', 'URL publica de la app', 'https://links.kingnect.app'],
        ['NEXTAUTH_SECRET', 'Secreto para JWT', 'Usa: openssl rand -base64 32'],
        ['NEXTAUTH_URL', 'URL callback NextAuth', 'https://links.kingnect.app'],
        ['STRIPE_SECRET_KEY', 'Clave privada Stripe', 'sk_live_...'],
        ['STRIPE_WEBHOOK_SECRET', 'Secreto webhooks Stripe', 'whsec_...'],
        ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Clave publica Stripe', 'pk_live_...'],
        ['GOOGLE_MAPS_API_KEY', 'API Google Maps', 'AIza...'],
        ['NEXT_PUBLIC_SUPABASE_URL', 'URL proyecto Supabase', 'https://xxx.supabase.co'],
        ['SUPABASE_SERVICE_ROLE_KEY', 'Service role key Supabase', 'eyJhbG...'],
        ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Anon key Supabase', 'eyJhbG...'],
        ['RESEND_API_KEY', 'API key Resend', 're_xxx...'],
        ['EMAIL_FROM', 'Email remitente', 'no-reply@kingnect.app'],
        ['NEXT_PUBLIC_SENTRY_DSN', 'DSN de Sentry', 'https://xxx@sentry.io/xxx'],
    ],
    [2.5, 2, 1.8]
))

story.append(Spacer(1, 8))
story.append(p(
    '<b>Importante:</b> Para produccion, debes migrar de SQLite a PostgreSQL (Supabase). '
    'Actualiza el schema de Prisma cambiando el provider de "sqlite" a "postgresql" y la '
    'DATABASE_URL a la conexion de Supabase. Luego ejecuta npx prisma migrate deploy para '
    'crear las tablas en la base de datos de produccion.'
))

# ─────────────────────────────────────────────────────────
# 12. CHECKLIST DE DESPLIEGUE
# ─────────────────────────────────────────────────────────
story.append(Spacer(1, 18))
story.append(h1('12. Checklist de Despliegue'))
story.append(Spacer(1, 6))
story.append(p(
    'Usa esta lista de verificacion antes y despues de desplegar Kingnect en produccion. '
    'Cada item es critico para asegurar que la plataforma funciona correctamente y de forma segura.'
))

story.append(Spacer(1, 8))

checklist_items = [
    ('Base de Datos', [
        'Migrar de SQLite a PostgreSQL (Supabase)',
        'Ejecutar prisma migrate deploy en produccion',
        'Ejecutar seed para crear planes y usuario admin',
        'Verificar conexion con GET /api/health',
    ]),
    ('Autenticacion', [
        'Cambiar NEXTAUTH_SECRET a un valor aleatorio fuerte',
        'Actualizar NEXTAUTH_URL al dominio de produccion',
        'Verificar que login/logout funciona correctamente',
        'Probar recuperacion de contrasena end-to-end',
    ]),
    ('Pagos', [
        'Configurar claves de Stripe en modo Live',
        'Crear endpoint de webhook en Stripe Dashboard',
        'Probar checkout con tarjeta real',
        'Verificar que webhooks actualizan suscripciones',
    ]),
    ('Email', [
        'Configurar Resend con API key real',
        'Verificar dominio en Resend',
        'Probar envio de email de recuperacion',
        'Probar email de bienvenida al registrar',
    ]),
    ('Almacenamiento', [
        'Crear bucket "uploads" en Supabase Storage',
        'Configurar politicas de acceso del bucket',
        'Probar subida de imagen desde el editor',
        'Verificar que las imagenes son accesibles publicamente',
    ]),
    ('Dominio y SSL', [
        'Configurar CNAME en DNS',
        'Agregar dominio en Vercel',
        'Verificar certificado SSL',
        'Actualizar NEXT_PUBLIC_APP_URL y NEXTAUTH_URL',
    ]),
    ('Seguridad', [
        'Revisar que NEXTAUTH_SECRET no es el de desarrollo',
        'Verificar headers de seguridad en next.config.ts',
        'Confirmar que SVG uploads estan bloqueados',
        'Verificar rate limiting en rutas criticas',
    ]),
    ('Monitoreo', [
        'Configurar Sentry con DSN real',
        'Configurar monitor de uptime en /api/health',
        'Verificar que los errores llegan a Sentry',
        'Probar el logger estructurado en produccion',
    ]),
    ('PWA', [
        'Verificar que manifest.webmanifest carga correctamente',
        'Verificar que los iconos PWA son accesibles',
        'Probar instalacion como PWA en movil',
        'Verificar service worker se registra en produccion',
    ]),
    ('Post-Deploy', [
        'Ejecutar tests E2E contra produccion',
        'Probar flujo completo de registro',
        'Probar flujo completo de edicion de Kinec',
        'Probar pagina publica de un Kinec',
        'Probar generacion y descarga de QR',
        'Verificar responsividad en movil',
    ]),
]

for category, items in checklist_items:
    story.append(h3(category))
    for item in items:
        story.append(bullet(item))
    story.append(Spacer(1, 4))

# ─────────────────────────────────────────────────────────
# BUILD PDF
# ─────────────────────────────────────────────────────────
doc.build(story)
print(f"PDF generated: {output_path}")
