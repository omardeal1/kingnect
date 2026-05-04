import { z } from "zod"

// ─── Auth Schemas ────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// ─── Mini Site Schemas ───────────────────────────────────────────────────────────

export const miniSiteSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  faviconUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  backgroundType: z.enum(["color", "gradient", "image"]).default("color"),
  backgroundColor: z.string().default("#FFFFFF"),
  backgroundGradient: z.string().optional(),
  backgroundImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  cardColor: z.string().default("#FFFFFF"),
  textColor: z.string().default("#0A0A0A"),
  accentColor: z.string().default("#D4A849"),
  themeMode: z.enum(["light", "dark", "both"]).default("light"),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  showKingBrand: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export type MiniSiteInput = z.infer<typeof miniSiteSchema>

// ─── Social Link Schema ──────────────────────────────────────────────────────────

export const socialLinkSchema = z.object({
  type: z.string().min(1, "Type is required"),
  label: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type SocialLinkInput = z.infer<typeof socialLinkSchema>

// ─── Contact Button Schema ───────────────────────────────────────────────────────

export const contactButtonSchema = z.object({
  type: z.string().min(1, "Type is required"),
  label: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type ContactButtonInput = z.infer<typeof contactButtonSchema>

// ─── Location Schema ─────────────────────────────────────────────────────────────

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  mapsUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  hours: z.string().optional(),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type LocationInput = z.infer<typeof locationSchema>

// ─── Slide Schema ────────────────────────────────────────────────────────────────

export const slideSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  buttonLabel: z.string().optional(),
  buttonUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type SlideInput = z.infer<typeof slideSchema>

// ─── Menu Category Schema ────────────────────────────────────────────────────────

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type MenuCategoryInput = z.infer<typeof menuCategorySchema>

// ─── Menu Item Schema ────────────────────────────────────────────────────────────

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isOrderable: z.boolean().default(false),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type MenuItemInput = z.infer<typeof menuItemSchema>

// ─── Gallery Image Schema ────────────────────────────────────────────────────────

export const galleryImageSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
  caption: z.string().optional(),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type GalleryImageInput = z.infer<typeof galleryImageSchema>

// ─── Service Schema ──────────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  buttonLabel: z.string().optional(),
  buttonUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type ServiceInput = z.infer<typeof serviceSchema>

// ─── Testimonial Schema ──────────────────────────────────────────────────────────

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  photoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").default(5),
  content: z.string().min(1, "Testimonial content is required"),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type TestimonialInput = z.infer<typeof testimonialSchema>

// ─── Custom Link Schema ──────────────────────────────────────────────────────────

export const customLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL"),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export type CustomLinkInput = z.infer<typeof customLinkSchema>

// ─── Order Schema ────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional(),
  deliveryType: z.enum(["pickup", "delivery"]).default("pickup"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string().min(1, "Item name is required"),
      quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
      unitPrice: z.number().min(0, "Price must be positive").default(0),
    })
  ).min(1, "At least one item is required"),
})

export type OrderInput = z.infer<typeof orderSchema>

// ─── Plan Schema ─────────────────────────────────────────────────────────────────

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  price: z.number().min(0, "Price must be positive").default(0),
  currency: z.string().default("USD"),
  billingInterval: z.enum(["month", "year"]).default("month"),
  trialDays: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  features: z.string().default("{}"),
  limits: z.string().default("{}"),
})

export type PlanInput = z.infer<typeof planSchema>

// ─── Client Schema ───────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  pipelineStatus: z.enum(["lead", "contacted", "demo", "active", "churned"]).default("lead"),
  accountStatus: z.enum(["active", "blocked", "cancelled"]).default("active"),
  notes: z.string().optional(),
})

export type ClientInput = z.infer<typeof clientSchema>

// ─── Platform Setting Schema ─────────────────────────────────────────────────────

export const platformSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  type: z.enum(["text", "json", "number", "boolean"]).default("text"),
})

export type PlatformSettingInput = z.infer<typeof platformSettingSchema>
