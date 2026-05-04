import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Globe,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Share2,
  Link2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"

// ─── App Info ────────────────────────────────────────────────────────────────────

export const APP_NAME = "Kingnect"
export const APP_URL = "https://links.kingnect.app"
export const APP_DESCRIPTION =
  "Todos los links de tu negocio en una mini web profesional con QR, lista para compartir e imprimir en tarjetas, carpas, banderas, flyers, stickers, menús y publicidad."
export const APP_TAGLINE =
  "Todos los links de tu negocio en una mini web profesional con QR"

// ─── Social Types ────────────────────────────────────────────────────────────────

export interface SocialType {
  value: string
  label: string
  icon: LucideIcon
  placeholder: string
}

export const SOCIAL_TYPES: SocialType[] = [
  { value: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/..." },
  { value: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/..." },
  { value: "tiktok", label: "TikTok", icon: MessageCircle, placeholder: "https://tiktok.com/..." },
  { value: "pinterest", label: "Pinterest", icon: ExternalLink, placeholder: "https://pinterest.com/..." },
  { value: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/..." },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/..." },
  { value: "twitter", label: "X (Twitter)", icon: Twitter, placeholder: "https://x.com/..." },
  { value: "snapchat", label: "Snapchat", icon: MessageCircle, placeholder: "https://snapchat.com/..." },
  { value: "threads", label: "Threads", icon: MessageCircle, placeholder: "https://threads.net/..." },
  { value: "yelp", label: "Yelp", icon: ExternalLink, placeholder: "https://yelp.com/..." },
  { value: "google_reviews", label: "Google Reviews", icon: ExternalLink, placeholder: "https://g.page/..." },
  { value: "website", label: "Sitio Web", icon: Globe, placeholder: "https://..." },
  { value: "custom", label: "Link Personalizado", icon: ExternalLink, placeholder: "https://..." },
]

// ─── Contact Button Types ────────────────────────────────────────────────────────

export interface ContactButtonType {
  value: string
  label: string
  icon: LucideIcon
  placeholder: string
  prefix?: string
}

export const CONTACT_BUTTON_TYPES: ContactButtonType[] = [
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    placeholder: "5215512345678",
    prefix: "https://wa.me/",
  },
  { value: "call", label: "Llamar", icon: Phone, placeholder: "+1 555 123 4567", prefix: "tel:" },
  { value: "sms", label: "SMS", icon: MessageCircle, placeholder: "+1 555 123 4567", prefix: "sms:" },
  { value: "email", label: "Correo", icon: Mail, placeholder: "hello@example.com", prefix: "mailto:" },
  { value: "maps", label: "Google Maps", icon: MapPin, placeholder: "https://maps.google.com/..." },
  { value: "share", label: "Compartir", icon: Share2, placeholder: "Compartir esta página" },
  { value: "copy_link", label: "Copiar Link", icon: Link2, placeholder: "Copiar link al portapapeles" },
  { value: "order", label: "Hacer Pedido", icon: ShoppingBag, placeholder: "Pedir en línea" },
]

// ─── Color Presets ───────────────────────────────────────────────────────────────

export interface ColorPreset {
  name: string
  backgroundColor: string
  cardColor: string
  textColor: string
  accentColor: string
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: "Blanco Premium",
    backgroundColor: "#FFFFFF",
    cardColor: "#FFFFFF",
    textColor: "#0A0A0A",
    accentColor: "#D4A849",
  },
  {
    name: "Negro y Dorado",
    backgroundColor: "#0A0A0A",
    cardColor: "#1A1A1A",
    textColor: "#F5F5F5",
    accentColor: "#D4A849",
  },
  {
    name: "Rojo Impacto",
    backgroundColor: "#1A0505",
    cardColor: "#2A0A0A",
    textColor: "#F5F0F0",
    accentColor: "#DC2626",
  },
  {
    name: "Azul Corporativo",
    backgroundColor: "#0A1628",
    cardColor: "#132238",
    textColor: "#F0F4F8",
    accentColor: "#2563EB",
  },
  {
    name: "Verde Negocio",
    backgroundColor: "#0A1A0F",
    cardColor: "#122318",
    textColor: "#F0F8F2",
    accentColor: "#16A34A",
  },
  {
    name: "Morado Elegante",
    backgroundColor: "#150A1A",
    cardColor: "#1F1228",
    textColor: "#F5F0F8",
    accentColor: "#9333EA",
  },
  {
    name: "Rosa Moderno",
    backgroundColor: "#1A0A14",
    cardColor: "#281220",
    textColor: "#F8F0F5",
    accentColor: "#EC4899",
  },
  {
    name: "Naranja Restaurante",
    backgroundColor: "#1A1005",
    cardColor: "#281A0A",
    textColor: "#F8F5F0",
    accentColor: "#EA580C",
  },
]

// ─── Order Statuses ──────────────────────────────────────────────────────────────

export interface OrderStatus {
  value: string
  label: string
  color: string
}

export const ORDER_STATUSES: OrderStatus[] = [
  { value: "new", label: "Nuevo", color: "#3B82F6" },
  { value: "confirmed", label: "Confirmado", color: "#8B5CF6" },
  { value: "preparing", label: "En proceso", color: "#F59E0B" },
  { value: "ready", label: "Listo", color: "#10B981" },
  { value: "delivered", label: "Entregado", color: "#6B7280" },
  { value: "cancelled", label: "Cancelado", color: "#EF4444" },
]

// ─── Plan Features ───────────────────────────────────────────────────────────────

export interface PlanInfo {
  slug: string
  name: string
  price: number
  currency: string
  billingInterval: string
  description: string
  features: string[]
  popular?: boolean
}

export const PLAN_FEATURES: PlanInfo[] = [
  {
    slug: "trial",
    name: "Trial",
    price: 0,
    currency: "USD",
    billingInterval: "month",
    description: "1 mes gratis para probar Kingnect",
    features: [
      "1 mini web",
      "QR en PNG",
      "Catálogo básico",
      "Con marca Kingnect",
    ],
  },
  {
    slug: "basico",
    name: "Básico",
    price: 9.99,
    currency: "USD",
    billingInterval: "month",
    description: "Todo lo esencial para tu negocio",
    features: [
      "1 mini web",
      "QR en PNG",
      "Redes sociales",
      "WhatsApp y ubicación",
      "Galería de fotos",
      "Con marca Kingnect",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    price: 24.99,
    currency: "USD",
    billingInterval: "month",
    description: "Para negocios que quieren más",
    features: [
      "1 mini web",
      "QR en PNG y SVG",
      "Catálogo completo",
      "Pedidos por WhatsApp",
      "Estadísticas",
      "Slides/Carrusel",
      "Sin marca opcional",
    ],
    popular: true,
  },
  {
    slug: "premium",
    name: "Premium",
    price: 49.99,
    currency: "USD",
    billingInterval: "month",
    description: "Todo incluido para crecer sin límites",
    features: [
      "Todo lo anterior",
      "Pedidos internos",
      "Múltiples ubicaciones",
      "Dominio personalizado",
      "Analíticas avanzadas",
      "Sin marca Kingnect",
      "Soporte prioritario",
    ],
  },
]

// ─── Pipeline Statuses ───────────────────────────────────────────────────────────

export const PIPELINE_STATUSES = [
  { value: "lead", label: "Lead", color: "#6B7280" },
  { value: "contacted", label: "Contactado", color: "#3B82F6" },
  { value: "demo", label: "Demo", color: "#8B5CF6" },
  { value: "active", label: "Activo", color: "#10B981" },
  { value: "churned", label: "Inactivo", color: "#EF4444" },
] as const

// ─── Account Statuses ────────────────────────────────────────────────────────────

export const ACCOUNT_STATUSES = [
  { value: "active", label: "Activo", color: "#10B981" },
  { value: "blocked", label: "Bloqueado", color: "#EF4444" },
  { value: "cancelled", label: "Cancelado", color: "#6B7280" },
] as const

// ─── Background Types ────────────────────────────────────────────────────────────

export const BACKGROUND_TYPES = [
  { value: "color", label: "Color sólido" },
  { value: "gradient", label: "Degradado" },
  { value: "image", label: "Imagen" },
] as const

// ─── Theme Modes ─────────────────────────────────────────────────────────────────

export const THEME_MODES = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "both", label: "Automático" },
] as const
