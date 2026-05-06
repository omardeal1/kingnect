// ─── Role Types ──────────────────────────────────────────────────────────────────

export type Role = "super_admin" | "client"

// ─── User & Site Types for Permission Checks ────────────────────────────────────

interface PermissionUser {
  id: string
  role: string
  client?: { id: string } | null
}

interface PermissionSite {
  clientId: string
}

// ─── Access Control Functions ────────────────────────────────────────────────────

/**
 * Check if a user can access the admin panel
 * Only super_admin can access admin routes
 */
export function canAccessAdmin(role: string): boolean {
  return role === "super_admin"
}

/**
 * Check if a user can access the dashboard
 * Both client and super_admin can access the dashboard
 */
export function canAccessDashboard(role: string): boolean {
  return role === "super_admin" || role === "client"
}

/**
 * Check if a user can edit a specific QAIROSS
 * Only the owner of the site (matching client) can edit
 * super_admin can edit any site
 */
export function canEditSite(user: PermissionUser, site: PermissionSite): boolean {
  if (user.role === "super_admin") return true

  if (user.role === "client" && user.client) {
    return user.client.id === site.clientId
  }

  return false
}

/**
 * Check if a user can view orders for a specific QAIROSS
 * Only the owner of the site (matching client) can view orders
 * super_admin can view any site's orders
 */
export function canViewOrders(user: PermissionUser, site: PermissionSite): boolean {
  if (user.role === "super_admin") return true

  if (user.role === "client" && user.client) {
    return user.client.id === site.clientId
  }

  return false
}

// ─── Plan Features & Limits ─────────────────────────────────────────────────────

export interface PlanFeatures {
  customDomain: boolean
  removeBranding: boolean
  analytics: boolean
  orders: boolean
  menu: boolean
  gallery: boolean
  services: boolean
  testimonials: boolean
  slides: boolean
  locations: boolean
  prioritySupport: boolean
}

export interface PlanLimits {
  maxSites: number
  maxSocialLinks: number
  maxContactButtons: number
  maxSlides: number
  maxMenuCategories: number
  maxMenuItems: number
  maxGalleryImages: number
  maxServices: number
  maxTestimonials: number
  maxCustomLinks: number
  maxLocations: number
}

const FREE_FEATURES: PlanFeatures = {
  customDomain: false,
  removeBranding: false,
  analytics: false,
  orders: false,
  menu: false,
  gallery: false,
  services: false,
  testimonials: false,
  slides: false,
  locations: false,
  prioritySupport: false,
}

const FREE_LIMITS: PlanLimits = {
  maxSites: 1,
  maxSocialLinks: 5,
  maxContactButtons: 3,
  maxSlides: 0,
  maxMenuCategories: 0,
  maxMenuItems: 0,
  maxGalleryImages: 0,
  maxServices: 0,
  maxTestimonials: 0,
  maxCustomLinks: 3,
  maxLocations: 1,
}

const STARTER_FEATURES: PlanFeatures = {
  customDomain: false,
  removeBranding: false,
  analytics: true,
  orders: false,
  menu: true,
  gallery: true,
  services: true,
  testimonials: true,
  slides: true,
  locations: true,
  prioritySupport: false,
}

const STARTER_LIMITS: PlanLimits = {
  maxSites: 1,
  maxSocialLinks: 10,
  maxContactButtons: 5,
  maxSlides: 5,
  maxMenuCategories: 3,
  maxMenuItems: 20,
  maxGalleryImages: 10,
  maxServices: 5,
  maxTestimonials: 5,
  maxCustomLinks: 10,
  maxLocations: 3,
}

const PRO_FEATURES: PlanFeatures = {
  customDomain: true,
  removeBranding: true,
  analytics: true,
  orders: true,
  menu: true,
  gallery: true,
  services: true,
  testimonials: true,
  slides: true,
  locations: true,
  prioritySupport: true,
}

const PRO_LIMITS: PlanLimits = {
  maxSites: 3,
  maxSocialLinks: 20,
  maxContactButtons: 10,
  maxSlides: 15,
  maxMenuCategories: 10,
  maxMenuItems: 100,
  maxGalleryImages: 50,
  maxServices: 20,
  maxTestimonials: 20,
  maxCustomLinks: 20,
  maxLocations: 10,
}

const ENTERPRISE_FEATURES: PlanFeatures = {
  customDomain: true,
  removeBranding: true,
  analytics: true,
  orders: true,
  menu: true,
  gallery: true,
  services: true,
  testimonials: true,
  slides: true,
  locations: true,
  prioritySupport: true,
}

const ENTERPRISE_LIMITS: PlanLimits = {
  maxSites: Infinity,
  maxSocialLinks: Infinity,
  maxContactButtons: Infinity,
  maxSlides: Infinity,
  maxMenuCategories: Infinity,
  maxMenuItems: Infinity,
  maxGalleryImages: Infinity,
  maxServices: Infinity,
  maxTestimonials: Infinity,
  maxCustomLinks: Infinity,
  maxLocations: Infinity,
}

const FEATURES_MAP: Record<string, PlanFeatures> = {
  trial: FREE_FEATURES,
  basico: STARTER_FEATURES,
  pro: PRO_FEATURES,
  premium: ENTERPRISE_FEATURES,
  free: FREE_FEATURES,
  starter: STARTER_FEATURES,
  enterprise: ENTERPRISE_FEATURES,
}

const LIMITS_MAP: Record<string, PlanLimits> = {
  trial: FREE_LIMITS,
  basico: STARTER_LIMITS,
  pro: PRO_LIMITS,
  premium: ENTERPRISE_LIMITS,
  free: FREE_LIMITS,
  starter: STARTER_LIMITS,
  enterprise: ENTERPRISE_LIMITS,
}

/**
 * Get the features available for a given plan slug
 * Falls back to free plan if the slug is unknown
 */
export function getPlanFeatures(planSlug: string): PlanFeatures {
  return FEATURES_MAP[planSlug] ?? FREE_FEATURES
}

/**
 * Get the limits for a given plan slug
 * Falls back to free plan limits if the slug is unknown
 */
export function getPlanLimits(planSlug: string): PlanLimits {
  return LIMITS_MAP[planSlug] ?? FREE_LIMITS
}
