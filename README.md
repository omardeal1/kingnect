# QAIROSS by QAIROSS

> Todos los links de tu negocio en un QAIROSS profesional con QR, lista para compartir e imprimir en tarjetas, carpas, banderas, flyers, stickers, menús y publicidad.

**Dominio:** [links.qaiross.app](https://links.qaiross.app)

---

## 🚀 Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) · React · TypeScript |
| Estilos | Tailwind CSS 4 · shadcn/ui · Framer Motion |
| Estado | Zustand · TanStack Query |
| Backend | Next.js API Routes · Prisma ORM · Zod |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| Pagos | Stripe (suscripciones + webhooks) |
| QR | qrcode.react (PNG y SVG) |
| PWA | manifest.json + Service Worker |
| Hosting | Vercel + Supabase |

---

## 📦 Instalación Local

### Prerrequisitos
- Node.js 18+
- npm, yarn o bun
- Cuenta de Supabase
- Cuenta de Stripe

### Pasos

```bash
# 1. Clonar el repositorio
git clone [repo-url]
cd qaiross

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores reales

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Crear la base de datos
npx prisma db push

# 6. Ejecutar el seed inicial (planes, admin, configuración)
npx prisma db seed
# O ejecutar manualmente: npx prisma db push && npx tsx prisma/seed.ts

# 7. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Primer Login de Admin

| Campo | Valor |
|-------|-------|
| Email | `admin@qaiross.app` |
| Contraseña | `Admin123!` |

⚠️ **Cambia la contraseña inmediatamente** después del primer login en el panel de admin.

---

## 🔧 Variables de Entorno

```env
# ─── Aplicación ───
NEXT_PUBLIC_APP_NAME=QAIROSS
NEXT_PUBLIC_APP_URL=https://links.qaiross.app

# ─── Base de datos ───
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# ─── Autenticación ───
NEXTAUTH_SECRET=tu-secreto-super-seguro-aqui
NEXTAUTH_URL=https://links.qaiross.app

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ─── Google Maps ───
GOOGLE_MAPS_API_KEY=...
```

---

## 🌐 Deploy en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit - QAIROSS"
git remote add origin https://github.com/tu-usuario/qaiross.git
git push -u origin main
```

### 2. Importar en Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Importar el repositorio de GitHub
4. Framework: **Next.js** (se detecta automáticamente)

### 3. Variables de Entorno
En Vercel → Settings → Environment Variables, agregar TODAS las variables del archivo `.env.local` con los valores de producción.

### 4. Deploy
Click en "Deploy". Vercel detecta Next.js automáticamente y construye el proyecto.

---

## 🔗 Conectar Dominio Personalizado

1. Ir a tu registrador de dominio (GoDaddy, Namecheap, etc.)
2. Crear registro **CNAME**:
   - **Nombre:** `links`
   - **Valor:** `cname.vercel-dns.com`
3. En Vercel → Settings → Domains
4. Agregar: `links.qaiross.app`
5. Verificar y esperar SSL automático (1-24 horas)

---

## 📁 Estructura del Proyecto

```
qaiross/
├── prisma/
│   ├── schema.prisma          # Esquema completo de la base de datos
│   └── seed.ts                # Datos iniciales (planes, admin)
├── database/
│   ├── schema.sql             # SQL para Supabase/PostgreSQL
│   └── seed.sql               # Seed en SQL
├── public/
│   ├── manifest.webmanifest   # PWA manifest principal
│   ├── sw.js                  # Service Worker
│   └── uploads/               # Imágenes subidas
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Landing page
│   │   ├── [slug]/page.tsx                    # QAIROSS pública
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx                 # Iniciar sesión
│   │   │   ├── register/page.tsx              # Registro
│   │   │   └── forgot-password/page.tsx       # Recuperar contraseña
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                   # Panel cliente
│   │   │       ├── billing/page.tsx           # Facturación
│   │   │       ├── orders/page.tsx            # Pedidos
│   │   │       └── sites/[id]/edit/page.tsx   # Editor QAIROSS
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── page.tsx                   # Dashboard admin
│   │   │       ├── clients/page.tsx           # Clientes
│   │   │       ├── pipeline/page.tsx          # CRM Kanban
│   │   │       ├── sites/page.tsx             # QAIROSS
│   │   │       ├── orders/page.tsx            # Pedidos globales
│   │   │       ├── plans/page.tsx             # Planes y precios
│   │   │       └── platform-editor/page.tsx   # CMS sin código
│   │   └── api/
│   │       ├── auth/                          # Autenticación
│   │       ├── sites/[id]/                    # CRUD QAIROSS + sub-recursos
│   │       ├── admin/                         # APIs del admin
│   │       ├── stripe/                        # Pagos Stripe
│   │       ├── orders/                        # Pedidos
│   │       ├── plans/                         # Planes públicos
│   │       ├── upload/                        # Subida de imágenes
│   │       ├── qr/[slug]/                     # QR como imagen
│   │       └── manifest/[slug]/               # PWA manifest dinámico
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── landing/          # Componentes de la landing
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── editor/           # 12 tabs del editor
│   │   ├── minisite/         # Componentes del QAIROSS público
│   │   ├── admin/            # Componentes del panel admin
│   │   └── providers/        # ThemeProvider, QueryProvider
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuración
│   │   ├── db.ts             # Prisma client
│   │   ├── validations.ts    # Schemas Zod
│   │   ├── permissions.ts    # RBAC + features por plan
│   │   ├── constants.ts      # Constantes de la app
│   │   ├── stripe.ts         # Helpers de Stripe
│   │   ├── security.ts       # Validaciones de seguridad
│   │   ├── rate-limit.ts     # Rate limiting
│   │   ├── editor-store.ts   # Zustand store del editor
│   │   └── api-helpers.ts    # Helpers para API routes
│   └── middleware.ts          # Protección de rutas
└── package.json
```

---

## 👥 Roles del Sistema

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| **Super Admin** | `/admin` | Control total de la plataforma (QAIROSS) |
| **Cliente** | `/dashboard` | Gestión de su propio QAIROSS |

---

## 💰 Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| **Trial** | Gratis (1 mes) | 1 QAIROSS · QR PNG · Catálogo básico · Marca QAIROSS |
| **Básico** | $9.99/mes | 1 QAIROSS · QR PNG · Redes · WhatsApp · Ubicación · Galería |
| **Pro** | $24.99/mes | 1 QAIROSS · QR PNG+SVG · Catálogo completo · Pedidos WhatsApp · Estadísticas · Sin marca |
| **Premium** | $49.99/mes | Todo · Pedidos internos · Múltiples ubicaciones · Dominio personalizado · Analíticas avanzadas |

Los planes son editables desde `/admin/plans`.

---

## 🔒 Seguridad

- RBAC verificado en cada API route
- Cada cliente solo accede a sus propios recursos
- Slugs validados como únicos antes de guardar
- URLs sanitizadas con Zod
- Límite de imagen: 2MB máximo
- Rate limiting en `/api/orders` para evitar spam
- Funciones bloqueadas según plan activo
- Webhooks de Stripe con verificación de firma
- Contraseñas hasheadas con bcrypt (12 rounds)

---

## 📱 PWA

### Plataforma Principal
- Instalable como app desde el navegador
- Funciona offline con página de fallback

### Cada QAIROSS
- Cada negocio puede instalarse como app independiente
- Manifest dinámico con nombre y logo del negocio
- Funciona offline mostrando datos en caché

---

## 🧪 Testing Rápido

```bash
# 1. Verificar que compila
npm run lint

# 2. Iniciar servidor
npm run dev

# 3. Probar la landing
open http://localhost:3000

# 4. Registrar un cliente
open http://localhost:3000/register

# 5. Login como admin
open http://localhost:3000/login
# Email: admin@qaiross.app
# Password: Admin123!

# 6. Acceder al panel admin
open http://localhost:3000/admin
```

---

## 📝 Notas de Deploy a Producción

1. **Supabase:** Ejecutar `/database/schema.sql` en el SQL Editor de Supabase para crear las tablas con RLS
2. **Stripe:** Configurar webhook apuntando a `https://links.qaiross.app/api/stripe/webhook` con los eventos: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.paid`
3. **Imágenes:** Configurar Supabase Storage bucket para uploads (reemplazar el upload local)
4. **Email:** Configurar proveedor de email para recuperación de contraseña
5. **SSL:** Vercel provee SSL automáticamente

---

**QAIROSS by QAIROSS** — *Simple por fuera. Poderoso por dentro.*
