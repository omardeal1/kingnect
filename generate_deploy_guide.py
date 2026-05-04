#!/usr/bin/env python3
"""
Genera la guia de despliegue a produccion para Kinec SaaS.
Salida: /home/z/my-project/download/Kinec-Guia-Despliegue-Produccion.pdf
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ============================================================
# FONT REGISTRATION
# ============================================================
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/chinese/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')

# Map logical names to physical fonts
HEADING_FONT = 'SarasaMonoSC-Bold'
HEADING_FONT_NORMAL = 'SarasaMonoSC'
BODY_FONT = 'Carlito'
BODY_FONT_BOLD = 'Carlito-Bold'
CODE_FONT = 'DejaVuSans'

# ============================================================
# COLOR PALETTE
# ============================================================
ACCENT       = HexColor('#562ad9')
TEXT_PRIMARY  = HexColor('#1a1b1c')
TEXT_MUTED    = HexColor('#7a8287')
BG_SURFACE   = HexColor('#dae0e5')
BG_PAGE      = HexColor('#f2f3f5')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = white
TABLE_ROW_EVEN     = white
TABLE_ROW_ODD     = BG_SURFACE

# ============================================================
# STYLES
# ============================================================
PAGE_W, PAGE_H = A4
LEFT_MARGIN = inch
RIGHT_MARGIN = inch
TOP_MARGIN = inch
BOTTOM_MARGIN = inch
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

styles = getSampleStyleSheet()

style_cover_title = ParagraphStyle(
    'CoverTitle', fontName=HEADING_FONT, fontSize=28, leading=36,
    textColor=ACCENT, alignment=TA_CENTER, spaceAfter=12
)
style_cover_subtitle = ParagraphStyle(
    'CoverSubtitle', fontName=BODY_FONT, fontSize=14, leading=20,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=8
)
style_cover_info = ParagraphStyle(
    'CoverInfo', fontName=BODY_FONT, fontSize=11, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=4
)
style_h1 = ParagraphStyle(
    'H1', fontName=HEADING_FONT, fontSize=18, leading=26,
    textColor=ACCENT, spaceBefore=24, spaceAfter=12,
    borderPadding=(0, 0, 4, 0),
)
style_h2 = ParagraphStyle(
    'H2', fontName=HEADING_FONT, fontSize=14, leading=20,
    textColor=ACCENT, spaceBefore=16, spaceAfter=8
)
style_h3 = ParagraphStyle(
    'H3', fontName=HEADING_FONT, fontSize=12, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=12, spaceAfter=6
)
style_body = ParagraphStyle(
    'Body', fontName=BODY_FONT, fontSize=10.5, leading=18,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6
)
style_body_muted = ParagraphStyle(
    'BodyMuted', fontName=BODY_FONT, fontSize=10, leading=16,
    textColor=TEXT_MUTED, alignment=TA_JUSTIFY, spaceAfter=6
)
style_bullet = ParagraphStyle(
    'Bullet', fontName=BODY_FONT, fontSize=10.5, leading=18,
    textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=3,
    bulletIndent=8, bulletFontSize=10.5
)
style_code = ParagraphStyle(
    'Code', fontName=CODE_FONT, fontSize=9, leading=14,
    textColor=HexColor('#c7254e'), backColor=HexColor('#f9f2f4'),
    leftIndent=12, rightIndent=12, spaceBefore=6, spaceAfter=6,
    borderPadding=(4, 6, 4, 6)
)
style_toc = ParagraphStyle(
    'TOC', fontName=BODY_FONT, fontSize=11, leading=22,
    textColor=TEXT_PRIMARY, leftIndent=0
)
style_toc_sub = ParagraphStyle(
    'TOCSub', fontName=BODY_FONT, fontSize=10, leading=18,
    textColor=TEXT_MUTED, leftIndent=20
)
style_table_header = ParagraphStyle(
    'TableHeader', fontName=BODY_FONT_BOLD, fontSize=9.5, leading=14,
    textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER
)
style_table_cell = ParagraphStyle(
    'TableCell', fontName=BODY_FONT, fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
style_table_cell_left = ParagraphStyle(
    'TableCellLeft', fontName=BODY_FONT, fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def h1(text):
    return Paragraph(text, style_h1)

def h2(text):
    return Paragraph(text, style_h2)

def h3(text):
    return Paragraph(text, style_h3)

def body(text):
    return Paragraph(text, style_body)

def body_muted(text):
    return Paragraph(text, style_body_muted)

def bullet(text):
    return Paragraph(text, style_bullet, bulletText='\u2022')

def code_block(text):
    return Paragraph(text, style_code)

def spacer(h=6):
    return Spacer(1, h)

def make_table(headers, rows, col_widths=None):
    """Build a styled table with Paragraph-wrapped cells."""
    header_cells = [Paragraph(h, style_table_header) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(c), style_table_cell) for c in row])

    if col_widths is None:
        n = len(headers)
        col_widths = [CONTENT_W / n] * n

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('FONTNAME', (0, 0), (-1, 0), BODY_FONT_BOLD),
        ('FONTSIZE', (0, 0), (-1, 0), 9.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


def make_table_left_first(headers, rows, col_widths=None):
    """Table with left-aligned first column, centered rest."""
    header_cells = [Paragraph(h, style_table_header) for h in headers]
    data = [header_cells]
    for row in rows:
        cells = []
        for idx, c in enumerate(row):
            if idx == 0:
                cells.append(Paragraph(str(c), style_table_cell_left))
            else:
                cells.append(Paragraph(str(c), style_table_cell))
        data.append(cells)

    if col_widths is None:
        n = len(headers)
        col_widths = [CONTENT_W / n] * n

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('FONTNAME', (0, 0), (-1, 0), BODY_FONT_BOLD),
        ('FONTSIZE', (0, 0), (-1, 0), 9.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


# ============================================================
# PAGE TEMPLATE WITH FOOTER PAGE NUMBERS
# ============================================================
def add_page_number(canvas, doc):
    """Draw page number on every page except the first (cover)."""
    page_num = doc.page
    if page_num <= 1:
        return
    canvas.saveState()
    canvas.setFont(BODY_FONT, 9)
    canvas.setFillColor(TEXT_MUTED)
    text = f"{page_num}"
    canvas.drawCentredString(PAGE_W / 2, 0.5 * inch, text)
    # Draw thin accent line above page number
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT_MARGIN, 0.65 * inch, PAGE_W - RIGHT_MARGIN, 0.65 * inch)
    canvas.restoreState()


# ============================================================
# BUILD DOCUMENT CONTENT
# ============================================================
story = []

# ---- COVER PAGE ----
story.append(Spacer(1, 2.2 * inch))
story.append(Paragraph("Kinec", style_cover_title))
story.append(Spacer(1, 8))
story.append(Paragraph("Guia de Despliegue a Produccion", ParagraphStyle(
    'CoverTitle2', fontName=HEADING_FONT, fontSize=22, leading=30,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=20
)))
story.append(Spacer(1, 16))
story.append(Paragraph("Plataforma SaaS de Centros Digitales con QR", style_cover_subtitle))
story.append(Spacer(1, 1.5 * inch))
story.append(Paragraph("King Designs", style_cover_info))
story.append(Paragraph("Mayo 2026", style_cover_info))
story.append(Spacer(1, 0.6 * inch))

# Thin accent line
cover_line_data = [['']]
cover_line = Table(cover_line_data, colWidths=[CONTENT_W * 0.4], rowHeights=[2])
cover_line.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), ACCENT),
    ('LINEBELOW', (0, 0), (-1, -1), 0, white),
]))
story.append(cover_line)

story.append(PageBreak())

# ---- TABLE OF CONTENTS ----
story.append(h1("Tabla de Contenidos"))
story.append(spacer(12))

toc_entries = [
    ("1", "Requisitos Previos"),
    ("2", "Base de Datos - Supabase PostgreSQL"),
    ("3", "Despliegue en Vercel"),
    ("4", "Dominio Personalizado - links.kingnect.app"),
    ("5", "Stripe - Pagos Reales"),
    ("6", "Email - Resend"),
    ("7", "Supabase Storage - Uploads"),
    ("8", "Google Maps API"),
    ("9", "PWA Icons"),
    ("10", "Variables de Entorno - Resumen Completo"),
    ("11", "Checklist de Verificacion"),
    ("12", "Primeros Pasos Post-Deploy"),
]

for num, title in toc_entries:
    story.append(Paragraph(
        f'<b>Seccion {num}.</b>  {title}',
        style_toc
    ))

story.append(PageBreak())

# ============================================================
# SECTION 1: Requisitos Previos
# ============================================================
story.append(h1("Seccion 1: Requisitos Previos"))
story.append(spacer(6))

story.append(body(
    "Antes de iniciar el proceso de despliegue a produccion de la plataforma Kinec, es fundamental "
    "asegurarse de contar con todas las cuentas de servicio necesarias y las herramientas de desarrollo "
    "adecuadas. Esta seccion detalla cada uno de los requisitos que deben cumplirse para garantizar un "
    "despliegue exitoso y sin interrupciones. La plataforma Kinec depende de multiples servicios en la nube "
    "para su funcionamiento completo: Vercel para el hosting de la aplicacion Next.js, Supabase como "
    "proveedor de base de datos PostgreSQL y almacenamiento de archivos, Stripe para el procesamiento de "
    "pagos y suscripciones, Resend para el envio de correos electronicos transaccionales, Google Cloud "
    "para la API de Maps, y un registrador de dominios como Namecheap o GoDaddy para la gestion del DNS. "
    "Ademas, es necesario contar con un entorno de desarrollo local configurado con Node.js version 18 o "
    "superior, Git para el control de versiones, y npm como gestor de paquetes. A continuacion se presenta "
    "una tabla con los costos estimados mensuales de cada servicio."
))

story.append(h2("Cuentas Necesarias y Costos Estimados"))
cost_headers = ["Servicio", "Plan Recomendado", "Costo Estimado (USD/mes)"]
cost_rows = [
    ["Vercel", "Pro ($20/mes)", "$20"],
    ["Supabase", "Pro ($25/mes)", "$25"],
    ["Stripe", "Pay-as-you-go", "2.9% + $0.30 por transaccion"],
    ["Resend", "Pro ($20/mes)", "$20"],
    ["Google Cloud", "Maps API", "$7 por 1000 cargas"],
    ["Namecheap/GoDaddy", "Dominio .app", "~$15/ano"],
]
story.append(make_table(cost_headers, cost_rows, [CONTENT_W * 0.28, CONTENT_W * 0.38, CONTENT_W * 0.34]))

story.append(h2("Herramientas de Desarrollo Requeridas"))
story.append(bullet("Node.js 18+ (se recomienda la version LTS mas reciente)"))
story.append(bullet("Git 2.x o superior para control de versiones"))
story.append(bullet("npm 9+ (incluido con Node.js) o pnpm como alternativa"))
story.append(bullet("Editor de codigo: VS Code con extensiones de Prisma y ESLint"))
story.append(bullet("Terminal con acceso a linea de comandos (bash, zsh o PowerShell)"))
story.append(bullet("Navegador moderno: Chrome, Firefox o Edge para pruebas"))

story.append(body(
    "Es altamente recomendable contar con acceso de administrador a todas las cuentas de servicio "
    "mencionadas. Para Stripe, se requerira completar el proceso de verificacion de identidad antes de "
    "poder recibir pagos reales. Para Resend, sera necesario verificar la propiedad del dominio mediante "
    "registros DNS especificos. El tiempo estimado para completar toda la configuracion es de 3 a 5 horas, "
    "dependiendo de la experiencia del equipo y la rapidez de la propagacion DNS."
))

story.append(PageBreak())

# ============================================================
# SECTION 2: Base de Datos - Supabase PostgreSQL
# ============================================================
story.append(h1("Seccion 2: Base de Datos - Supabase PostgreSQL"))
story.append(spacer(6))

story.append(body(
    "Supabase es la plataforma de base de datos como servicio que utiliza Kinec para almacenar toda la "
    "informacion de la aplicacion, incluyendo datos de usuarios, centros, planes de suscripcion, pagos y "
    "configuraciones. A diferencia del entorno de desarrollo que utiliza SQLite con Prisma, el entorno de "
    "produccion requiere PostgreSQL para manejar conexiones concurrentes, escalabilidad y funcionalidades "
    "avanzadas. El primer paso es crear un proyecto nuevo en el dashboard de Supabase (supabase.com), "
    "seleccionando la region mas cercana a los usuarios objetivo. Se recomienda la region US East (iad1) "
    "para mantener la misma zona que Vercel y minimizar la latencia. Al crear el proyecto, se generara "
    "automaticamente una base de datos PostgreSQL con todas las credenciales necesarias."
))

story.append(h2("Paso a Paso: Configuracion de Supabase"))
story.append(bullet(
    "Navegar a supabase.com y crear una cuenta o iniciar sesion con GitHub."
))
story.append(bullet(
    "Hacer clic en 'New Project' y completar el nombre del proyecto (ej: kinec-production) "
    "y una contrasena segura para la base de datos."
))
story.append(bullet(
    "Seleccionar la region 'East US (North Virginia)' para minimizar la latencia con Vercel."
))
story.append(bullet(
    "Esperar a que el proyecto se provisione (aproximadamente 2 minutos)."
))
story.append(bullet(
    "Ir a Settings > Database y copiar la Connection String (URI) con formato: "
    "postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
))

story.append(h2("Migracion de Prisma: SQLite a PostgreSQL"))
story.append(body(
    "El proyecto Kinec utiliza Prisma como ORM y viene configurado por defecto con SQLite para desarrollo "
    "local. Para produccion, es necesario cambiar el provider a PostgreSQL. El proyecto incluye un archivo "
    "schema.prisma.prod que ya tiene la configuracion correcta para PostgreSQL. Simplemente copie este "
    "archivo sobre el schema.prisma principal antes de ejecutar las migraciones. Los comandos necesarios son:"
))
story.append(code_block("cp prisma/schema.prisma.prod prisma/schema.prisma"))
story.append(code_block("npx prisma migrate deploy"))
story.append(code_block("npx prisma generate"))

story.append(h2("Claves de Supabase Necesarias"))
story.append(body(
    "Debera obtener tres claves esenciales desde el dashboard de Supabase (Settings > API) que se "
    "configuraran como variables de entorno en Vercel. Estas claves son fundamentales para que la "
    "aplicacion pueda conectarse a la base de datos y utilizar los servicios de autenticacion."
))

keys_headers = ["Clave", "Formato", "Ubicacion en Supabase"]
keys_rows = [
    ["NEXT_PUBLIC_SUPABASE_URL", "https://xxxx.supabase.co", "Settings > API > Project URL"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGci...", "Settings > API > Project API keys > anon public"],
    ["SUPABASE_SERVICE_ROLE_KEY", "eyJhbGci...", "Settings > API > Project API keys > service_role secret"],
]
story.append(make_table(keys_headers, keys_rows, [CONTENT_W * 0.36, CONTENT_W * 0.28, CONTENT_W * 0.36]))

story.append(body(
    "Importante: La Service Role Key tiene acceso total a la base de datos sin restricciones de RLS "
    "(Row Level Security). Nunca debe exponerse en el codigo del cliente. Utilicela unicamente en rutas "
    "API del servidor (server-side). La anon key es segura para el lado del cliente ya que esta sujeta a "
    "las politicas RLS configuradas en Supabase."
))

story.append(PageBreak())

# ============================================================
# SECTION 3: Despliegue en Vercel
# ============================================================
story.append(h1("Seccion 3: Despliegue en Vercel"))
story.append(spacer(6))

story.append(body(
    "Vercel es la plataforma de despliegue recomendada para aplicaciones Next.js, ofreciendo integracion "
    "nativa con el framework, despliegue automatico desde GitHub, CDN global, SSL automatico y escalado "
    "sin configuracion adicional. El proceso de despliegue en Vercel es directo pero requiere atencion "
    "especial a la configuracion de variables de entorno y al comando de build personalizado. Antes de "
    "desplegar, asegurese de que todo el codigo este confirmado y enviado al repositorio principal de "
    "GitHub. La rama principal (main o master) sera la fuente del despliegue productivo. Se recomienda "
    "utilizar Preview Deployments para ramas de desarrollo antes de fusionar a la rama principal."
))

story.append(h2("Configuracion Inicial en Vercel"))
story.append(bullet(
    "Crear una cuenta en vercel.com (se recomienda usar la cuenta de GitHub del proyecto)."
))
story.append(bullet(
    "Hacer clic en 'Add New Project' y seleccionar el repositorio de GitHub de Kinec."
))
story.append(bullet(
    "En Framework Preset, seleccionar 'Next.js' (Vercel lo detecta automaticamente)."
))
story.append(bullet(
    "Configurar el Build Command personalizado: npx prisma generate &amp;&amp; next build"
))
story.append(bullet(
    "Configurar el Output Directory: .next (valor por defecto de Next.js)."
))
story.append(bullet(
    "En Region, seleccionar 'iad1 - Washington, D.C., USA' para coincidir con Supabase."
))

story.append(h2("Variables de Entorno para Vercel"))
story.append(body(
    "Las variables de entorno son criticas para el funcionamiento de la aplicacion. Todas las claves API, "
    "URLs de conexion y secretos deben configurarse en Vercel antes del primer despliegue. A continuacion "
    "se presenta la tabla completa de variables necesarias. Estas se configuran en Settings > Environment "
    "Variables del proyecto en Vercel."
))

vercel_env_headers = ["Variable", "Descripcion"]
vercel_env_rows = [
    ["NEXT_PUBLIC_SUPABASE_URL", "URL del proyecto Supabase"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Clave publica anon de Supabase"],
    ["SUPABASE_SERVICE_ROLE_KEY", "Clave secreta de servicio de Supabase"],
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "Clave publica de Stripe (pk_live_...)"],
    ["STRIPE_SECRET_KEY", "Clave secreta de Stripe (sk_live_...)"],
    ["STRIPE_WEBHOOK_SECRET", "Secreto del webhook de Stripe (whsec_...)"],
    ["RESEND_API_KEY", "Clave API de Resend para emails"],
    ["EMAIL_FROM", "Email remitente (noreply@kingnect.app)"],
    ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "Clave API de Google Maps"],
    ["NEXT_PUBLIC_APP_URL", "https://links.kingnect.app"],
    ["NEXTAUTH_SECRET", "Secreto para NextAuth (generar con openssl rand -base64 32)"],
    ["NEXTAUTH_URL", "https://links.kingnect.app"],
    ["DATABASE_URL", "Cadena de conexion PostgreSQL de Supabase"],
]
story.append(make_table_left_first(vercel_env_headers, vercel_env_rows, [CONTENT_W * 0.48, CONTENT_W * 0.52]))

story.append(h2("Comando de Build y Verificacion"))
story.append(body(
    "El comando de build debe generar el cliente Prisma antes de compilar la aplicacion Next.js. En la "
    "configuracion del proyecto en Vercel, vaya a Settings > General > Build &amp; Development Settings y "
    "configure el Build Command como se indica a continuacion. Es importante que el comando de build "
    "incluya la generacion del cliente Prisma, de lo contrario la aplicacion fallara al intentar conectarse "
    "a la base de datos en tiempo de ejecucion."
))
story.append(code_block("npx prisma generate &amp;&amp; next build"))

story.append(body(
    "Despues de configurar todas las variables de entorno y el comando de build, haga clic en 'Deploy' "
    "para iniciar el primer despliegue. El proceso tardara entre 2 y 5 minutos. Si el despliegue falla, "
    "revise los logs en la pestana 'Deployments' de Vercel para identificar el error. Los problemas mas "
    "comunes son variables de entorno faltantes o errores en la migracion de la base de datos."
))

story.append(PageBreak())

# ============================================================
# SECTION 4: Dominio Personalizado
# ============================================================
story.append(h1("Seccion 4: Dominio Personalizado - links.kingnect.app"))
story.append(spacer(6))

story.append(body(
    "Configurar un dominio personalizado es esencial para la identidad de marca y la confianza de los "
    "usuarios. El dominio links.kingnect.app sera la URL principal de la plataforma Kinec en produccion. "
    "Vercel facilita la configuracion de dominios personalizados con SSL automatico mediante Let's Encrypt. "
    "El proceso involucra dos partes: la configuracion en Vercel y la actualizacion de los registros DNS "
    "en el registrador del dominio. Antes de comenzar, asegurese de tener acceso de administrador al "
    "panel de DNS del dominio kingnect.app. Si el dominio fue adquirido en Namecheap, el panel de DNS "
    "se encuentra en Domain List > Manage > Advanced DNS. Para GoDaddy, esta en My Products > DNS > DNS "
    "Records. El subdominio 'links' se creara mediante un registro CNAME que apunte a Vercel."
))

story.append(h2("Paso 1: Agregar Dominio en Vercel"))
story.append(bullet(
    "Ir a Settings > Domains en el dashboard del proyecto en Vercel."
))
story.append(bullet(
    "Ingresar 'links.kingnect.app' en el campo de nuevo dominio y hacer clic en 'Add'."
))
story.append(bullet(
    "Vercel mostrara los registros DNS necesarios para configurar. Anotar el valor del CNAME."
))

story.append(h2("Paso 2: Configurar DNS en el Registrador"))
story.append(body(
    "Agregar un registro CNAME en el panel de DNS del dominio kingnect.app con los siguientes valores:"
))

dns_headers = ["Campo", "Valor"]
dns_rows = [
    ["Type", "CNAME"],
    ["Host", "links"],
    ["Value", "cname.vercel-dns.com"],
    ["TTL", "Automatico (o 3600)"],
]
story.append(make_table(dns_headers, dns_rows, [CONTENT_W * 0.30, CONTENT_W * 0.70]))

story.append(h2("Paso 3: Propagacion y SSL"))
story.append(body(
    "Despues de agregar el registro CNAME, debera esperar entre 5 y 10 minutos para que la propagacion "
    "DNS se complete. En algunos casos, puede tardar hasta 48 horas dependiendo del proveedor de DNS, "
    "aunque generalmente es mucho mas rapido. Una vez que Vercel detecte el registro DNS correcto, "
    "automaticamente generara y configurara un certificado SSL a traves de Let's Encrypt. Puede verificar "
    "el estado de la configuracion en Settings > Domains de Vercel, donde deberia aparecer un check verde "
    "junto al dominio. Para confirmar que todo funciona correctamente, abra un navegador y visite "
    "https://links.kingnect.app. Deberia ver la pagina principal de Kinec con el candado de SSL en la "
    "barra de direcciones."
))

story.append(body(
    "Importante: No intente acceder al sitio hasta que el certificado SSL este emitido. Si el dominio "
    "muestra un error de certificado, espere unos minutos y vuelva a intentarlo. Vercel renueva "
    "automaticamente los certificados SSL antes de que expiren, por lo que no es necesario realizar "
    "ninguna accion de mantenimiento posterior."
))

story.append(PageBreak())

# ============================================================
# SECTION 5: Stripe - Pagos Reales
# ============================================================
story.append(h1("Seccion 5: Stripe - Pagos Reales"))
story.append(spacer(6))

story.append(body(
    "Stripe es la plataforma de procesamiento de pagos que utiliza Kinec para gestionar las suscripciones "
    "de los centros digitales. En el entorno de desarrollo se utilizan claves de prueba (pk_test_ y "
    "sk_test_), pero para produccion es necesario activar la cuenta de Stripe y obtener las claves reales "
    "(pk_live_ y sk_live_). Antes de poder procesar pagos reales, Stripe requiere completar un proceso de "
    "verificacion de identidad que incluye informacion personal o empresarial, numero de identificacion "
    "fiscal y datos bancarios para los depositos. Este proceso puede tardar entre 1 y 3 dias habiles. Es "
    "recomendable iniciar este proceso con anticipacion para evitar retrasos en el lanzamiento."
))

story.append(h2("Activacion de Cuenta y Claves Live"))
story.append(bullet(
    "Iniciar sesion en dashboard.stripe.com y completar el proceso de activacion de la cuenta."
))
story.append(bullet(
    "Proporcionar la informacion del negocio: nombre legal, direccion, numero de identificacion fiscal."
))
story.append(bullet(
    "Agregar la cuenta bancaria para recibir los depositos de los pagos."
))
story.append(bullet(
    "Esperar la verificacion (generalmente 1-3 dias habiles)."
))
story.append(bullet(
    "Una vez verificada, ir a Developers > API keys y copiar la Publishable key (pk_live_...) y la "
    "Secret key (sk_live_...)."
))

story.append(h2("Configuracion del Webhook"))
story.append(body(
    "Los webhooks de Stripe son esenciales para que Kinec reciba notificaciones en tiempo real sobre "
    "eventos de pago, como suscripciones completadas, facturas pagadas o fallos en el cobro. Sin el "
    "webhook configurado, la aplicacion no podra actualizar automaticamente el estado de las suscripciones "
    "de los usuarios. Para configurar el webhook, siga estos pasos:"
))
story.append(bullet(
    "Ir a Developers > Webhooks en el dashboard de Stripe."
))
story.append(bullet(
    "Hacer clic en 'Add endpoint' e ingresar la URL: "
    "https://links.kingnect.app/api/stripe/webhook"
))
story.append(bullet(
    "Seleccionar los siguientes eventos que la aplicacion necesita escuchar:"
))

webhook_headers = ["Evento", "Descripcion"]
webhook_rows = [
    ["checkout.session.completed", "Se completa una sesion de checkout"],
    ["invoice.paid", "Se paga una factura de suscripcion"],
    ["invoice.payment_failed", "Falla el pago de una factura"],
    ["customer.subscription.deleted", "Se cancela una suscripcion"],
    ["customer.subscription.updated", "Se actualiza una suscripcion"],
]
story.append(make_table_left_first(webhook_headers, webhook_rows, [CONTENT_W * 0.45, CONTENT_W * 0.55]))

story.append(spacer(8))
story.append(body(
    "Despues de crear el endpoint, haga clic en el mismo para ver los detalles y copie el 'Signing secret' "
    "que comienza con whsec_... Este secreto es necesario para verificar que los webhooks recibidos "
    "provienen realmente de Stripe y no han sido alterados. Configure las tres variables de Stripe en "
    "Vercel (Settings > Environment Variables): NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY y "
    "STRIPE_WEBHOOK_SECRET. Despues de actualizar las variables, redepliegue la aplicacion para que los "
    "cambios surtan efecto."
))

story.append(PageBreak())

# ============================================================
# SECTION 6: Email - Resend
# ============================================================
story.append(h1("Seccion 6: Email - Resend"))
story.append(spacer(6))

story.append(body(
    "Resend es el servicio de email transaccional que utiliza Kinec para enviar correos de verificacion de "
    "cuenta, recuperacion de contrasena, confirmaciones de pago y notificaciones del sistema. A diferencia "
    "de otros servicios como SendGrid o Mailgun, Resend ofrece una API moderna y simple, con una excelente "
    "tasa de entrega y precios competitivos. Para utilizar Resend en produccion, es obligatorio verificar "
    "el dominio de envio, lo que garantiza que los correos no sean marcados como spam y mejora la "
    "reputacion del remitente. El proceso de verificacion requiere agregar registros DNS especificos "
    "(SPF, DKIM y DMARC) en el panel de DNS del dominio kingnect.app."
))

story.append(h2("Configuracion Paso a Paso"))
story.append(bullet(
    "Crear una cuenta en resend.com (se recomienda usar la cuenta de GitHub del proyecto)."
))
story.append(bullet(
    "Ir a Domains > Add Domain e ingresar 'kingnect.app'."
))
story.append(bullet(
    "Resend mostrara tres registros DNS que deben agregarse en el panel del dominio:"
))

dns_email_headers = ["Tipo", "Host", "Valor"]
dns_email_rows = [
    ["TXT", "@", "v=spf1 include:resend.com ~all"],
    ["CNAME", "resend._domainkey", "[valor proporcionado por Resend]"],
    ["TXT", "_dmarc", "v=DMARC1; p=none;"],
]
story.append(make_table_left_first(dns_email_headers, dns_email_rows, [CONTENT_W * 0.15, CONTENT_W * 0.30, CONTENT_W * 0.55]))

story.append(spacer(8))
story.append(bullet(
    "Agregar los registros DNS en el panel del registrador del dominio (Namecheap o GoDaddy)."
))
story.append(bullet(
    "Volver a Resend y hacer clic en 'Verify DNS Records'. Esperar la propagacion (5-30 minutos)."
))
story.append(bullet(
    "Una vez verificado el dominio, ir a API Keys > Create API Key."
))
story.append(bullet(
    "Nombrar la clave (ej: 'kinec-production') y copiarla. Solo se muestra una vez."
))
story.append(bullet(
    "Configurar en Vercel: RESEND_API_KEY=[clave] y EMAIL_FROM=noreply@kingnect.app"
))

story.append(h2("Prueba de Envio"))
story.append(body(
    "Despues de configurar las variables de entorno en Vercel y redesplegar la aplicacion, pruebe el envio "
    "de correos utilizando la funcion de recuperacion de contrasena en la pantalla de login. Ingrese un "
    "email registrado y verifique que el correo llegue a la bandeja de entrada (no a spam). Si el correo "
    "no llega, revise los logs de Resend en el dashboard para identificar el problema. Los errores mas "
    "comunes son registros DNS mal configurados o la falta de verificacion del dominio."
))

story.append(PageBreak())

# ============================================================
# SECTION 7: Supabase Storage - Uploads
# ============================================================
story.append(h1("Seccion 7: Supabase Storage - Uploads"))
story.append(spacer(6))

story.append(body(
    "Supabase Storage es el servicio de almacenamiento de archivos que utiliza Kinec para guardar las "
    "imagenes subidas por los usuarios, como logos de centros, fotos de perfil y otros recursos visuales. "
    "Los archivos se almacenan en buckets (contenedores) con politicas de acceso configurables. Para la "
    "plataforma Kinec, se necesita un bucket llamado 'uploads' con acceso publico de lectura, lo que "
    "permite que las imagenes sean accesibles desde cualquier navegador sin necesidad de autenticacion. "
    "Las variables de entorno necesarias para el almacenamiento ya fueron configuradas en el Paso 2 "
    "(Supabase), ya que Storage utiliza las mismas credenciales que la base de datos. No se requieren "
    "variables adicionales."
))

story.append(h2("Creacion del Bucket"))
story.append(bullet(
    "Ir al dashboard de Supabase y seleccionar el proyecto de Kinec."
))
story.append(bullet(
    "Navegar a Storage en el menu lateral izquierdo."
))
story.append(bullet(
    "Hacer clic en 'New Bucket' e ingresar el nombre 'uploads'."
))
story.append(bullet(
    "Marcar la opcion 'Public bucket' para permitir acceso de lectura sin autenticacion."
))
story.append(bullet(
    "Hacer clic en 'Create Bucket' para finalizar la creacion."
))

story.append(h2("Configuracion de Politicas de Acceso"))
story.append(body(
    "Despues de crear el bucket, es necesario configurar las politicas de acceso para permitir que los "
    "usuarios autenticados puedan subir archivos y que cualquier persona pueda ver las imagenes subidas. "
    "Para configurar las politicas, haga clic en el bucket 'uploads' y luego en 'Policies'. Agregue las "
    "siguientes politicas:"
))

policy_headers = ["Politica", "Operacion", "Condicion"]
policy_rows = [
    ["Public Read", "SELECT", "true (cualquier usuario puede leer)"],
    ["Authenticated Upload", "INSERT", "auth.role() = 'authenticated'"],
    ["Owner Delete", "DELETE", "auth.uid() = owner"],
]
story.append(make_table_left_first(policy_headers, policy_rows, [CONTENT_W * 0.25, CONTENT_W * 0.20, CONTENT_W * 0.55]))

story.append(body(
    "Con esta configuracion, las imagenes estaran disponibles en URLs publicas con el formato: "
    "https://[project-ref].supabase.co/storage/v1/object/public/uploads/[filename]. Esto permite "
    "que las imagenes se carguen rapidamente en la interfaz de la aplicacion sin necesidad de tokens "
    "de autenticacion adicionales. Los archivos subidos se almacenan con redundancia y alta disponibilidad "
    "garantizada por la infraestructura de Supabase en AWS."
))

story.append(PageBreak())

# ============================================================
# SECTION 8: Google Maps API
# ============================================================
story.append(h1("Seccion 8: Google Maps API"))
story.append(spacer(6))

story.append(body(
    "La integracion con Google Maps es fundamental para la plataforma Kinec, ya que permite mostrar la "
    "ubicacion de los centros digitales en un mapa interactivo y habilitar la busqueda de centros cercanos "
    "basada en la geolocalizacion del usuario. Google Cloud Platform ofrece la Maps JavaScript API que "
    "proporciona todas las funcionalidades necesarias para renderizar mapas, colocar marcadores y calcular "
    "rutas. Para utilizar esta API en produccion, es necesario crear un proyecto en Google Cloud Console, "
    "habilitar la API y generar una clave API restringida al dominio de la aplicacion. La restriccion de "
    "dominio es una medida de seguridad critica que evita el uso no autorizado de la clave API y protege "
    "contra cargos inesperados por uso indebido."
))

story.append(h2("Configuracion en Google Cloud Console"))
story.append(bullet(
    "Navegar a console.cloud.google.com e iniciar sesion con una cuenta de Google."
))
story.append(bullet(
    "Crear un nuevo proyecto haciendo clic en 'Select a project' > 'New Project'. Nombrarlo 'Kinec Production'."
))
story.append(bullet(
    "Ir a 'APIs &amp; Services' > 'Library' y buscar 'Maps JavaScript API'."
))
story.append(bullet(
    "Hacer clic en 'Enable' para habilitar la API en el proyecto."
))
story.append(bullet(
    "Ir a 'APIs &amp; Services' > 'Credentials' y hacer clic en 'Create Credentials' > 'API Key'."
))
story.append(bullet(
    "Copiar la clave API generada y luego hacer clic en 'Restrict Key'."
))
story.append(bullet(
    "En 'Application restrictions', seleccionar 'HTTP referrers (web sites)'."
))
story.append(bullet(
    "Agregar el dominio: https://links.kingnect.app/* y hacer clic en 'Save'."
))

story.append(h2("Configuracion en Vercel"))
story.append(body(
    "La clave API de Google Maps es una variable publica (NEXT_PUBLIC_) ya que se utiliza en el navegador "
    "del cliente para renderizar el mapa. Configure la siguiente variable de entorno en Vercel: "
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[su-clave-api]. Al ser una clave publica, la restriccion de dominio "
    "es la unica medida de seguridad. Asegurese de que la restriccion este correctamente configurada antes "
    "de desplegar. Para verificar que la API funciona correctamente, acceda a la aplicacion y navegue a "
    "una pagina que contenga un mapa. El mapa deberia renderizarse sin errores en la consola del navegador."
))

story.append(body(
    "Nota sobre costos: Google Maps ofrece $200 de credito mensual gratuito, lo que equivale a "
    "aproximadamente 28,000 cargas de mapa por mes sin costo. Para la mayoria de las plataformas SaaS "
    "con un volumen moderado de usuarios, este credito es suficiente. Monitoree el uso en Google Cloud "
    "Console bajo 'Billing' para asegurarse de que no se exceda el credito gratuito."
))

story.append(PageBreak())

# ============================================================
# SECTION 9: PWA Icons
# ============================================================
story.append(h1("Seccion 9: PWA Icons"))
story.append(spacer(6))

story.append(body(
    "Los iconos de la Progressive Web App (PWA) son esenciales para que la aplicacion pueda instalarse "
    "en dispositivos moviles y mostrarse correctamente en las pantallas de inicio, barras de tareas y "
    "menus de aplicaciones. Kinec esta configurado como una PWA, lo que permite a los usuarios agregar "
    "la aplicacion a su pantalla de inicio desde el navegador y obtener una experiencia similar a una "
    "aplicacion nativa. El archivo manifest.webmanifest ya esta configurado en el proyecto y hace "
    "referencia a los iconos en las rutas /public/icons/icon-192x192.png y /public/icons/icon-512x512.png. "
    "Solo es necesario generar los archivos de imagen con el logo de Kinec y colocarlos en las ubicaciones "
    "correctas."
))

story.append(h2("Generacion de Iconos"))
story.append(bullet(
    "Utilizar el logo oficial de Kinec como base para los iconos."
))
story.append(bullet(
    "Generar un icono de 192x192 pixeles en formato PNG con fondo transparente."
))
story.append(bullet(
    "Generar un icono de 512x512 pixeles en formato PNG con fondo transparente."
))
story.append(bullet(
    "Herramientas recomendadas: Figma, Adobe Illustrator, o herramientas online como realfavicongenerator.net."
))
story.append(bullet(
    "Asegurarse de que el logo sea claramente visible y reconocible en el tamano de 192x192."
))

story.append(h2("Ubicacion de Archivos"))
story.append(body(
    "Los iconos deben colocarse en las siguientes rutas dentro del directorio /public del proyecto:"
))

icon_headers = ["Archivo", "Ruta", "Tamano"]
icon_rows = [
    ["icon-192x192.png", "/public/icons/icon-192x192.png", "192x192 px"],
    ["icon-512x512.png", "/public/icons/icon-512x512.png", "512x512 px"],
    ["favicon.ico", "/public/favicon.ico", "32x32 px (recomendado)"],
]
story.append(make_table(icon_headers, icon_rows, [CONTENT_W * 0.28, CONTENT_W * 0.42, CONTENT_W * 0.30]))

story.append(body(
    "El archivo manifest.webmanifest ya esta configurado correctamente en el proyecto y hara referencia "
    "automaticamente a estos iconos. No es necesario modificar ningun archivo de configuracion adicional. "
    "Despues de agregar los iconos, haga commit y push al repositorio. Vercel desplegara automaticamente "
    "la nueva version y los iconos estaran disponibles. Para probar la PWA, abra la aplicacion en Chrome "
    "en un dispositivo movil y verifique que aparezca el prompt de instalacion con el icono correcto."
))

story.append(PageBreak())

# ============================================================
# SECTION 10: Variables de Entorno - Resumen Completo
# ============================================================
story.append(h1("Seccion 10: Variables de Entorno - Resumen Completo"))
story.append(spacer(6))

story.append(body(
    "Esta seccion presenta un resumen completo de todas las variables de entorno necesarias para el "
    "funcionamiento de la plataforma Kinec en produccion. Todas estas variables deben configurarse en "
    "Vercel (Settings > Environment Variables) antes de realizar el primer despliegue. Es fundamental "
    "no omitir ninguna variable, ya que la aplicacion fallara al iniciar si alguna de las claves "
    "requeridas no esta definida. Se recomienda copiar los valores exactamente como se muestran en los "
    "respectivos dashboards de cada servicio, sin espacios adicionales al inicio o al final. Las variables "
    "que comienzan con NEXT_PUBLIC_ son accesibles desde el navegador del cliente, mientras que las demas "
    "solo estan disponibles en el servidor. Nunca exponga claves secretas (como STRIPE_SECRET_KEY o "
    "SUPABASE_SERVICE_ROLE_KEY) en variables NEXT_PUBLIC_."
))

env_headers = ["Variable", "Valor de Ejemplo", "Donde Obtenerla"]
env_rows = [
    ["NEXT_PUBLIC_SUPABASE_URL", "https://xxxx.supabase.co", "Supabase > Settings > API"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJI...", "Supabase > Settings > API"],
    ["SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJI...", "Supabase > Settings > API"],
    ["DATABASE_URL", "postgresql://postgres...", "Supabase > Settings > Database"],
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_live_...", "Stripe > Developers > API Keys"],
    ["STRIPE_SECRET_KEY", "sk_live_...", "Stripe > Developers > API Keys"],
    ["STRIPE_WEBHOOK_SECRET", "whsec_...", "Stripe > Developers > Webhooks"],
    ["RESEND_API_KEY", "re_...", "Resend > API Keys"],
    ["EMAIL_FROM", "noreply@kingnect.app", "Email verificado en Resend"],
    ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "AIza...", "Google Cloud > Credentials"],
    ["NEXT_PUBLIC_APP_URL", "https://links.kingnect.app", "URL del dominio configurado"],
    ["NEXTAUTH_SECRET", "[cadena aleatoria 32 chars]", "Generar: openssl rand -base64 32"],
    ["NEXTAUTH_URL", "https://links.kingnect.app", "URL del dominio configurado"],
]
cw = [CONTENT_W * 0.34, CONTENT_W * 0.30, CONTENT_W * 0.36]
story.append(make_table_left_first(env_headers, env_rows, cw))

story.append(spacer(12))
story.append(h2("Notas Importantes"))
story.append(bullet(
    "NEXTAUTH_SECRET debe ser una cadena aleatoria unica y segura. Nunca reutilice la misma clave en "
    "diferentes entornos (desarrollo y produccion)."
))
story.append(bullet(
    "DATABASE_URL debe usar el formato de conexion de Supabase con el pooler (puerto 6543) para "
    "manejar conexiones concurrentes eficientemente."
))
story.append(bullet(
    "Todas las claves que contienen 'live' en su nombre o valor son de produccion. Verifique que no "
    "este utilizando claves de prueba (test) en el entorno de produccion."
))
story.append(bullet(
    "Despues de agregar o modificar variables de entorno en Vercel, es necesario redesplegar la "
    "aplicacion para que los cambios surtan efecto."
))

story.append(PageBreak())

# ============================================================
# SECTION 11: Checklist de Verificacion
# ============================================================
story.append(h1("Seccion 11: Checklist de Verificacion"))
story.append(spacer(6))

story.append(body(
    "Antes de declarar la plataforma Kinec como lista para produccion, es imprescindible verificar cada "
    "uno de los siguientes items. Este checklist asegura que no se ha omitido ningun paso critico en el "
    "proceso de configuracion y que todos los servicios estan funcionando correctamente. Imprima esta "
    "pagina y marque cada item a medida que lo verifica. Si algun item no pasa la verificacion, no "
    "proceda con el lanzamiento hasta que el problema sea resuelto. Una verificacion exhaustiva antes del "
    "lanzamiento previene problemas que podrian afectar la experiencia de los usuarios y la reputacion "
    "de la plataforma."
))

check_headers = ["#", "Item de Verificacion", "OK"]
check_rows = [
    ["1", "Proyecto de Supabase creado y accesible", ""],
    ["2", "Base de datos PostgreSQL migrada con prisma migrate deploy", ""],
    ["3", "Variables de Supabase configuradas en Vercel (URL, anon key, service role key)", ""],
    ["4", "Repositorio conectado a Vercel y primer despliegue exitoso", ""],
    ["5", "Build command configurado: npx prisma generate && next build", ""],
    ["6", "Region de Vercel configurada como iad1", ""],
    ["7", "Dominio links.kingnect.app agregado en Vercel", ""],
    ["8", "Registro CNAME configurado en DNS (links -> cname.vercel-dns.com)", ""],
    ["9", "Certificado SSL emitido y activo (candado verde en navegador)", ""],
    ["10", "Sitio accesible en https://links.kingnect.app", ""],
    ["11", "Cuenta de Stripe activada y verificada", ""],
    ["12", "Claves live de Stripe configuradas (pk_live_ y sk_live_)", ""],
    ["13", "Webhook de Stripe creado con los 5 eventos requeridos", ""],
    ["14", "Webhook signing secret (whsec_) configurado en Vercel", ""],
    ["15", "Dominio verificado en Resend (SPF, DKIM, DMARC)", ""],
    ["16", "API key de Resend configurada en Vercel", ""],
    ["17", "Email de prueba enviado y recibido correctamente", ""],
    ["18", "Bucket 'uploads' creado en Supabase Storage", ""],
    ["19", "Politica de acceso publico configurada en el bucket", ""],
    ["20", "Google Maps API habilitada y clave API generada", ""],
    ["21", "Clave API de Google Maps restringida a links.kingnect.app", ""],
    ["22", "Iconos PWA generados (192x192 y 512x512) y colocados en /public/icons/", ""],
    ["23", "Todas las variables de entorno configuradas en Vercel", ""],
    ["24", "NEXTAUTH_SECRET generado con cadena aleatoria segura", ""],
    ["25", "Aplicacion renderiza correctamente en dispositivos moviles", ""],
]
check_cw = [CONTENT_W * 0.06, CONTENT_W * 0.78, CONTENT_W * 0.16]
story.append(make_table_left_first(check_headers, check_rows, check_cw))

story.append(PageBreak())

# ============================================================
# SECTION 12: Primeros Pasos Post-Deploy
# ============================================================
story.append(h1("Seccion 12: Primeros Pasos Post-Deploy"))
story.append(spacer(6))

story.append(body(
    "Una vez completado el despliegue y verificados todos los items del checklist, es momento de realizar "
    "las primeras configuraciones dentro de la plataforma y ejecutar las pruebas funcionales que validen "
    "que el sistema opera correctamente en su totalidad. Esta seccion describe los pasos necesarios para "
    "configurar la plataforma para su uso real y las pruebas que deben realizarse para asegurar que cada "
    "modulo critico funciona como se espera. Se recomienda realizar estas pruebas en orden secuencial, "
    "ya que algunas dependen de configuraciones realizadas en pasos anteriores. Documente cualquier "
    "problema encontrado durante las pruebas y resuelvalo antes de abrir la plataforma a los usuarios."
))

story.append(h2("1. Crear el Super Administrador"))
story.append(body(
    "El primer usuario que se cree en la plataforma debe tener el rol de super_admin, que otorga acceso "
    "total al sistema, incluyendo la gestion de otros administradores y la configuracion global. Para crear "
    "este usuario, acceda a https://links.kingnect.app y complete el formulario de registro. Luego, "
    "utilice el panel de SQL de Supabase para actualizar el rol del usuario recien creado:"
))
story.append(code_block(
    'UPDATE "User" SET role = \'super_admin\' WHERE email = \'su-email@ejemplo.com\';'
))
story.append(body(
    "Verifique que el usuario puede acceder al panel de administracion y que tiene permisos para gestionar "
    "todos los modulos del sistema. Este paso es fundamental ya que sin un super_admin, no es posible "
    "configurar los planes de precios ni gestionar otros usuarios."
))

story.append(h2("2. Configurar Planes de Precios"))
story.append(body(
    "Acceda al panel de administracion como super_admin y configure los planes de suscripcion que se "
    "ofreceran a los centros digitales. Cada plan debe tener un precio, una descripcion y un ID de precio "
    "de Stripe correspondiente. Los IDs de precio de Stripe se obtienen del dashboard de Stripe en "
    "Products > [Producto] > Pricing. Asegurese de utilizar los IDs de produccion (que comienzan con "
    "price_) y no los de prueba. Configure al menos tres planes: Basico, Profesional y Enterprise, con "
    "diferentes limites de funcionalidades y precios competitivos para el mercado objetivo."
))

story.append(h2("3. Probar Flujo Completo de Registro"))
story.append(body(
    "Cree una cuenta de usuario de prueba y verifique que todo el flujo de registro funciona correctamente: "
    "formulario de registro, verificacion de email, creacion de perfil y redireccion al dashboard. "
    "Verifique que los datos del usuario se almacenan correctamente en Supabase y que las sesiones se "
    "mantienen activas entre navegaciones."
))

story.append(h2("4. Probar Checkout de Stripe"))
story.append(body(
    "Realice una suscripcion de prueba utilizando una tarjeta de credito de prueba de Stripe. Aunque las "
    "claves son de produccion, puede utilizar la tarjeta 4242 4242 4242 4242 con cualquier fecha futura "
    "y CVC para verificar que el flujo de checkout funciona. Confirme que el webhook recibe los eventos "
    "correctamente y que el estado de la suscripcion se actualiza en la base de datos."
))

story.append(h2("5. Probar Email de Recuperacion"))
story.append(body(
    "Utilice la funcionalidad de 'Olvide mi contrasena' y verifique que el email de recuperacion llega "
    "correctamente a la bandeja de entrada (no a spam). Confirme que el enlace de recuperacion funciona "
    "y permite establecer una nueva contrasena. Este flujo es critico para la experiencia del usuario."
))

story.append(h2("6. Probar Upload de Imagenes"))
story.append(body(
    "Suba una imagen de perfil y un logo de centro para verificar que el almacenamiento en Supabase "
    "Storage funciona correctamente. Confirme que las imagenes se muestran correctamente en la interfaz "
    "y que los archivos aparecen en el bucket 'uploads' del dashboard de Supabase."
))

story.append(h2("7. Probar Generacion de QR"))
story.append(body(
    "Cree un centro digital y verifique que el codigo QR se genera correctamente, apuntando a la URL "
    "correcta del centro. Escanee el QR con un dispositivo movil y confirme que redirige a la pagina "
    "del centro. Verifique que el QR se puede descargar como imagen PNG y que la resolucion es adecuada "
    "para impresion en materiales fisicos como tarjetas de visita o carteles."
))

story.append(spacer(20))
story.append(body(
    "Con todas estas pruebas completadas exitosamente, la plataforma Kinec esta lista para recibir "
    "usuarios reales. Se recomienda monitorear los primeros dias de operacion utilizando los dashboards "
    "de Vercel (Analytics), Supabase (Logs) y Stripe (Dashboard) para detectar y resolver cualquier "
    "problema que no se haya identificado durante las pruebas. Mantenga un canal de comunicacion directo "
    "con los primeros usuarios para recibir feedback temprano y realizar ajustes rapidos."
))


# ============================================================
# BUILD PDF
# ============================================================
OUTPUT_PATH = "/home/z/my-project/download/Kinec-Guia-Despliegue-Produccion.pdf"

doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title="Kinec - Guia de Despliegue a Produccion",
    author="King Designs",
    subject="Guia de despliegue de la plataforma SaaS Kinec",
)

doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)

# ============================================================
# VERIFICATION
# ============================================================
import os
file_size = os.path.getsize(OUTPUT_PATH)
print(f"PDF generado exitosamente: {OUTPUT_PATH}")
print(f"Tamano del archivo: {file_size:,} bytes ({file_size / 1024:.1f} KB)")

# Count pages using ReportLab
from reportlab.lib.utils import open_for_read
import re

with open(OUTPUT_PATH, 'rb') as f:
    content = f.read()
    page_count = len(re.findall(b'/Type\\s*/Page[^s]', content))
    print(f"Numero de paginas: {page_count}")
