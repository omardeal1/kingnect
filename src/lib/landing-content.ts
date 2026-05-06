// ─── Landing Content Types & Defaults ───────────────────────────────────────────
// Used by both the admin landing editor and the public landing page
// to provide type-safe, structured content management.

export interface LandingImage {
  key: string
  url: string
  alt: string
  width?: number
  height?: number
}

export interface LandingSection {
  id?: string
  sectionKey: string
  sectionType: "json" | "image"
  title?: string | null
  subtitle?: string | null
  content: Record<string, unknown>
  images: LandingImage[]
  isActive: boolean
  sortOrder: number
}

export interface HeroContent {
  badge: string
  title1: string
  titleHighlight: string
  title2: string
  description: string
  cta: string
  secondaryCta: string
  stats: string
}

export interface BenefitItem {
  key: string
  title: string
  description: string
}

export interface BenefitsContent {
  badge: string
  items: BenefitItem[]
}

export interface StepItem {
  key: string
  title: string
  description: string
}

export interface HowItWorksContent {
  badge: string
  steps: StepItem[]
}

export interface OrderFeatureItem {
  title: string
  description: string
  features: string[]
  highlighted: boolean
}

export interface OrdersContent {
  badge: string
  features: OrderFeatureItem[]
}

export interface PricingContent {
  badge: string
  popular: string
  perMonth: string
  startFree: string
  choosePlan: string
}

export interface TestimonialItem {
  name: string
  business: string
  quote: string
  rating: number
}

export interface TestimonialsContent {
  badge: string
  items: TestimonialItem[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQContent {
  badge: string
  items: FAQItem[]
}

export interface CTAContent {
  title: string
  subtitle: string
  button: string
  stats: string
}

export interface FooterContent {
  description: string
  copyright: string
}

// ─── Section key order ──────────────────────────────────────────────────────────

export const SECTION_ORDER: string[] = [
  "hero",
  "benefits",
  "howItWorks",
  "orders",
  "pricing",
  "testimonials",
  "faq",
  "cta",
  "footer",
]

// ─── Default content (Spanish) ──────────────────────────────────────────────────

export const DEFAULT_HERO: HeroContent = {
  badge: "Tu negocio digital comienza aquí",
  title1: "Tu negocio en un",
  titleHighlight: "QAIROSS profesional",
  title2: "con QR",
  description:
    "Todos los links, contactos y servicios de tu negocio en una sola página. Genera tu QR, imprímelo en tarjetas, carpas o banderas, y recibe más clientes.",
  cta: "Crear mi QAIROSS",
  secondaryCta: "Ver demo",
  stats: "Sin tarjeta de crédito · Listo en 5 minutos · Prueba gratis",
}

export const DEFAULT_BENEFITS: BenefitsContent = {
  badge: "Beneficios",
  items: [
    {
      key: "links",
      title: "Todos tus links en un lugar",
      description:
        "Reúne tus redes sociales, WhatsApp, ubicación y sitio web en un solo QAIROSS. Tus clientes encuentran todo al instante.",
    },
    {
      key: "qr",
      title: "QR listo para imprimir",
      description:
        "Genera tu código QR en PNG y SVG. Descárgalo y úsalo en cualquier material impreso sin perder calidad.",
    },
    {
      key: "print",
      title: "Para tarjetas, carpas y banderas",
      description:
        "Imprime tu QR en tarjetas de presentación, carpas publicitarias, banderas y flyers. Tu QAIROSS siempre accesible.",
    },
    {
      key: "noCode",
      title: "Sin saber programar",
      description:
        "No necesitas conocimientos técnicos. Desde el panel editas todo de forma visual e intuitiva en minutos.",
    },
    {
      key: "dashboard",
      title: "Edita desde tu panel",
      description:
        "Cambia textos, fotos, colores y botones cuando quieras. Los cambios se reflejan al instante en tu QAIROSS.",
    },
    {
      key: "local",
      title: "Para negocios locales",
      description:
        "Diseñado especialmente para negocios locales que quieren tener presencia digital sin complicaciones ni costos altos.",
    },
    {
      key: "whatsapp",
      title: "Más contactos por WhatsApp",
      description:
        "Un botón de WhatsApp directo en tu QAIROSS. Tus clientes te contactan con un solo toque desde su celular.",
    },
    {
      key: "catalog",
      title: "Muestra servicios y productos",
      description:
        "Agrega tu catálogo de productos o servicios con precios, fotos y descripciones. Todo organizado y profesional.",
    },
  ],
}

export const DEFAULT_HOW_IT_WORKS: HowItWorksContent = {
  badge: "Paso a paso",
  steps: [
    {
      key: "register",
      title: "Regístrate",
      description: "Crea tu cuenta gratis en menos de un minuto.",
    },
    {
      key: "logo",
      title: "Sube tu logo y datos",
      description: "Agrega tu logo, nombre, descripción y colores de marca.",
    },
    {
      key: "networks",
      title: "Activa tus redes y botones",
      description: "Conecta WhatsApp, Instagram, Facebook y más con un clic.",
    },
    {
      key: "products",
      title: "Agrega productos o menú",
      description: "Sube tu catálogo con fotos, precios y descripciones.",
    },
    {
      key: "publish",
      title: "Publica tu QAIROSS",
      description: "Un clic y tu QAIROSS está online para todo el mundo.",
    },
    {
      key: "downloadQr",
      title: "Descarga tu QR",
      description: "Obtén tu código QR en PNG y SVG para imprimir.",
    },
    {
      key: "print",
      title: "Imprímelo en tarjetas, carpas o banderas",
      description: "Usa tu QR en cualquier material impreso y recibe clientes.",
    },
  ],
}

export const DEFAULT_ORDERS: OrdersContent = {
  badge: "Pedidos",
  features: [
    {
      title: "Pedidos por WhatsApp",
      description:
        "Tus clientes arman su pedido desde tu QAIROSS y al confirmar se abre WhatsApp con el detalle completo. Tú recibes el mensaje y gestionas todo desde tu celular.",
      features: [
        "Sin configuración extra",
        "Llega directo a tu WhatsApp",
        "Incluido en plan Pro",
      ],
      highlighted: false,
    },
    {
      title: "Panel interno de pedidos",
      description:
        "Los pedidos llegan directo a tu panel de QAIROSS. Gestiona estados, notifica a tus clientes y lleva un registro completo de todas las órdenes recibidas.",
      features: [
        "Panel de administración",
        "Estados y notificaciones",
        "Incluido en plan Premium",
      ],
      highlighted: true,
    },
  ],
}

export const DEFAULT_PRICING: PricingContent = {
  badge: "Precios",
  popular: "Más popular",
  perMonth: "/mes",
  startFree: "Comenzar gratis",
  choosePlan: "Elegir plan",
}

export const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  badge: "Testimonios",
  items: [
    {
      name: "María García",
      business: "Restaurante La Casa",
      quote:
        "Desde que puse el QR en las mesas, mis clientes consultan el menú desde su celular. ¡Los pedidos por WhatsApp se duplicaron!",
      rating: 5,
    },
    {
      name: "Carlos López",
      business: "Barbería Elite",
      quote:
        "Mi QAIROSS se ve increíble. Los clientes me encuentran por el QR de mis tarjetas y agendan cita por WhatsApp directamente.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      business: "Clínica Dental Sonrisa",
      quote:
        "Profesional y fácil de usar. Mis pacientes pueden ver mis servicios y agendar desde su celular. El panel es muy intuitivo.",
      rating: 5,
    },
    {
      name: "Roberto Sánchez",
      business: "Food Truck El Sabor",
      quote:
        "Comparto mi ubicación en tiempo real y el menú del día desde mi QAIROSS. ¡Mis seguidores siempre saben dónde estoy!",
      rating: 4,
    },
    {
      name: "Laura Torres",
      business: "Boutique Elegante",
      quote:
        "Antes no tenía presencia digital. Ahora mis clientes ven mis productos nuevos y me escriben por WhatsApp para comprar.",
      rating: 5,
    },
    {
      name: "Diego Ramírez",
      business: "Taller Mecánico DR",
      quote:
        "Mis clientes ven la lista de servicios y precios. Me ahorra mucho tiempo responder las mismas preguntas una y otra vez.",
      rating: 5,
    },
  ],
}

export const DEFAULT_FAQ: FAQContent = {
  badge: "FAQ",
  items: [
    {
      question: "¿Qué es un QAIROSS?",
      answer:
        "Un QAIROSS es una página web optimizada para celular que reúne toda la información de tu negocio en un solo lugar: redes sociales, WhatsApp, ubicación, servicios, productos y más. Se accede mediante un código QR o un enlace directo.",
    },
    {
      question: "¿Necesito saber programar para crear mi QAIROSS?",
      answer:
        "No, para nada. QAIROSS está diseñado para que cualquier persona pueda crear su QAIROSS sin conocimientos técnicos. Todo se edita desde un panel visual e intuitivo. Solo necesitas subir tu logo, agregar tus datos y publicar.",
    },
    {
      question: "¿Cómo funciona el código QR?",
      answer:
        "Al publicar tu QAIROSS, se genera automáticamente un código QR único. Puedes descargarlo en PNG o SVG e imprimirlo en tarjetas, carpas, banderas, flyers o cualquier material publicitario.",
    },
    {
      question: "¿Puedo editar mi QAIROSS después de publicarla?",
      answer:
        "Sí, puedes editar tu QAIROSS en cualquier momento desde tu panel de administración. Cambia textos, fotos, colores, botones y servicios. Los cambios se reflejan al instante para tus clientes.",
    },
    {
      question: "¿Cómo reciben pedidos mis clientes?",
      answer:
        "Hay dos formas: en el plan Pro, tus clientes arman su pedido y al confirmar se abre WhatsApp con el detalle. En el plan Premium, los pedidos llegan a tu panel interno donde puedes gestionar estados y notificar a tus clientes.",
    },
    {
      question: "¿En qué puedo imprimir el código QR?",
      answer:
        "Puedes imprimir tu QR en tarjetas de presentación, carpas publicitarias, banderas, flyers, stickers, menús, mesas, vitrinas y cualquier material impreso. El formato SVG garantiza calidad en cualquier tamaño.",
    },
    {
      question: "¿Cuál es la diferencia entre los planes?",
      answer:
        "El plan Trial es gratis por 1 mes con funciones básicas. El plan Básico incluye redes sociales y galería. El plan Pro agrega catálogo completo, pedidos por WhatsApp y estadísticas. El plan Premium incluye todo más pedidos internos, dominio personalizado y soporte prioritario.",
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer:
        "Sí, puedes cancelar tu suscripción cuando quieras sin penalización. Tu QAIROSS seguirá activa hasta el final del período pagado. No hay contratos de permanencia ni cargos ocultos.",
    },
  ],
}

export const DEFAULT_CTA: CTAContent = {
  title: "¿Listo para crear tu QAIROSS?",
  subtitle:
    "Únete a cientos de negocios que ya usan QAIROSS para tener presencia digital. Comienza gratis hoy mismo.",
  button: "Crear mi QAIROSS",
  stats: "Sin tarjeta de crédito · Configura en 5 minutos · Soporte en español",
}

export const DEFAULT_FOOTER: FooterContent = {
  description: "by QAIROSS",
  copyright: "© 2025 QAIROSS. Todos los derechos reservados.",
}

// ─── Default sections map ───────────────────────────────────────────────────────

export const DEFAULT_SECTIONS: Record<string, LandingSection> = {
  hero: {
    sectionKey: "hero",
    sectionType: "json",
    title: null,
    subtitle: null,
    content: DEFAULT_HERO,
    images: [],
    isActive: true,
    sortOrder: 0,
  },
  benefits: {
    sectionKey: "benefits",
    sectionType: "json",
    title: "Todo lo que tu negocio necesita",
    subtitle:
      "Una solución completa para llevar tu negocio al mundo digital",
    content: DEFAULT_BENEFITS,
    images: [],
    isActive: true,
    sortOrder: 1,
  },
  howItWorks: {
    sectionKey: "howItWorks",
    sectionType: "json",
    title: "¿Cómo funciona?",
    subtitle: "En solo 7 pasos tu QAIROSS estará lista para recibir clientes",
    content: DEFAULT_HOW_IT_WORKS,
    images: [],
    isActive: true,
    sortOrder: 2,
  },
  orders: {
    sectionKey: "orders",
    sectionType: "json",
    title: "Recibe pedidos directamente",
    subtitle:
      "Dos formas de recibir pedidos según las necesidades de tu negocio",
    content: DEFAULT_ORDERS,
    images: [],
    isActive: true,
    sortOrder: 3,
  },
  pricing: {
    sectionKey: "pricing",
    sectionType: "json",
    title: "Planes y precios",
    subtitle: "Elige el plan perfecto para tu negocio. Comienza gratis.",
    content: DEFAULT_PRICING,
    images: [],
    isActive: true,
    sortOrder: 4,
  },
  testimonials: {
    sectionKey: "testimonials",
    sectionType: "json",
    title: "Lo que dicen nuestros clientes",
    subtitle: "Negocios reales que ya usan QAIROSS para crecer",
    content: DEFAULT_TESTIMONIALS,
    images: [],
    isActive: true,
    sortOrder: 5,
  },
  faq: {
    sectionKey: "faq",
    sectionType: "json",
    title: "Preguntas frecuentes",
    subtitle: "Respuestas a las dudas más comunes sobre QAIROSS",
    content: DEFAULT_FAQ,
    images: [],
    isActive: true,
    sortOrder: 6,
  },
  cta: {
    sectionKey: "cta",
    sectionType: "json",
    title: null,
    subtitle: null,
    content: DEFAULT_CTA,
    images: [],
    isActive: true,
    sortOrder: 7,
  },
  footer: {
    sectionKey: "footer",
    sectionType: "json",
    title: null,
    subtitle: null,
    content: DEFAULT_FOOTER,
    images: [],
    isActive: true,
    sortOrder: 8,
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Parse a JSON string safely, with fallback */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/** Parse images JSON string */
export function parseImages(imagesJson: string | null | undefined): LandingImage[] {
  return safeJsonParse<LandingImage[]>(imagesJson, [])
}

/** Convert a DB record to a LandingSection */
export function dbToSection(record: {
  id: string
  sectionKey: string
  sectionType: string
  title: string | null
  subtitle: string | null
  content: string
  images: string
  isActive: boolean
  sortOrder: number
}): LandingSection {
  return {
    id: record.id,
    sectionKey: record.sectionKey,
    sectionType: record.sectionType as "json" | "image",
    title: record.title,
    subtitle: record.subtitle,
    content: safeJsonParse(record.content, {}),
    images: parseImages(record.images),
    isActive: record.isActive,
    sortOrder: record.sortOrder,
  }
}

/** Get section default content by key */
export function getSectionDefault(sectionKey: string): LandingSection {
  return (
    DEFAULT_SECTIONS[sectionKey] ?? {
      sectionKey,
      sectionType: "json",
      content: {},
      images: [],
      isActive: true,
      sortOrder: SECTION_ORDER.indexOf(sectionKey) ?? 99,
    }
  )
}
