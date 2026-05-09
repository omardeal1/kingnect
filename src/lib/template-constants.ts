export type SiteTemplate = "classic" | "medical" | "premium" | "fashion"

export interface TemplateInfo {
  id: SiteTemplate
  name: string
  description: { es: string; en: string }
  previewColors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  features: string[]
}

export const SITE_TEMPLATES: TemplateInfo[] = [
  {
    id: "medical",
    name: "Servicios Profesionales",
    description: {
      es: "Diseño limpio y profesional con grid de servicios, slider principal y barra inferior fija. Ideal para clínicas, spas, consultorios y servicios.",
      en: "Clean and professional design with service grid, main slider and fixed bottom bar. Ideal for clinics, spas, offices and services.",
    },
    previewColors: {
      primary: "#1E3A5F",
      secondary: "#4A90D9",
      accent: "#2196F3",
      background: "#F0F4F8",
    },
    features: ["Grid de servicios", "Slider con swipe", "Barra inferior fija", "Switch EN/ES"],
  },
  {
    id: "premium",
    name: "Premium Elegante",
    description: {
      es: "Estilo premium con glassmorphism, sliders infinitos verticales y horizontales, y diseño elegante. Para marcas de lujo y negocios premium.",
      en: "Premium style with glassmorphism, infinite vertical and horizontal sliders, and elegant design. For luxury brands and premium businesses.",
    },
    previewColors: {
      primary: "#1A1A1A",
      secondary: "#2D2D2D",
      accent: "#D4A849",
      background: "#0F0F0F",
    },
    features: ["Glassmorphism", "Sliders infinitos", "Menú vertical", "Diseño premium"],
  },
  {
    id: "fashion",
    name: "Moderno Urbano",
    description: {
      es: "Diseño moderno y urbano con tarjetas deslizables, barra de iconos horizontal y estilo fashion. Para tiendas, marcas y negocios creativos.",
      en: "Modern and urban design with sliding cards, horizontal icon bar and fashion style. For stores, brands and creative businesses.",
    },
    previewColors: {
      primary: "#2C2C2C",
      secondary: "#3D3D3D",
      accent: "#C9A96E",
      background: "#FAFAFA",
    },
    features: ["Tarjetas deslizables", "Barra de iconos", "Diseño urbano", "Galería moderna"],
  },
]

export const DEFAULT_TEMPLATE: SiteTemplate = "classic"
