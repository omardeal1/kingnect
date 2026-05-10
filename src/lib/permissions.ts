import { db } from "@/lib/db"

// ─── Role Types ──────────────────────────────────────────────────────────────────

export type Role = "super_admin" | "client"

// ─── RBAC Types ──────────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "client" | "employee"

export interface PermissionEntry {
  module: string
  action: string
}

export interface UserPermissions {
  userId: string
  role: string
  employeeId?: string | null
  roleId?: string | null
  permissions: PermissionEntry[]
}

// ─── User & Site Types for Permission Checks ────────────────────────────────────

interface PermissionUser {
  id: string
  role: string
  client?: { id: string } | null
}

interface PermissionSite {
  clientId: string
}

// ─── RBAC Functions ─────────────────────────────────────────────────────────────

/**
 * Get all permissions for a user (handles super_admin, client, employee)
 * Super admins get ALL permissions
 * Clients get basic site owner permissions
 * Employees get permissions from their Role → RolePermission chain
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })

  if (!user) {
    return { userId, role: "unknown", permissions: [] }
  }

  // Super admins have all permissions
  if (user.role === "super_admin") {
    const allPerms = await db.permission.findMany({
      select: { module: true, action: true },
      orderBy: [{ module: "asc" }, { action: "asc" }],
    })
    return {
      userId: user.id,
      role: user.role,
      permissions: allPerms.map((p) => ({ module: p.module, action: p.action })),
    }
  }

  // Check if user is linked to an Employee record
  const employee = await db.employee.findFirst({
    where: { userId: user.id, isActive: true },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  })

  if (employee) {
    return {
      userId: user.id,
      role: "employee",
      employeeId: employee.id,
      roleId: employee.roleId,
      permissions: employee.role.permissions.map((rp) => ({
        module: rp.permission.module,
        action: rp.permission.action,
      })),
    }
  }

  // Client: basic site owner permissions
  return {
    userId: user.id,
    role: "client",
    permissions: [],
  }
}

/**
 * Check if a user has a specific permission
 * Returns true for super_admin always
 * For employees, checks their role's permissions
 */
export async function hasPermission(
  userId: string,
  module: string,
  action: string
): Promise<boolean> {
  const userPerms = await getUserPermissions(userId)

  // Super admins always have all permissions
  if (userPerms.role === "super_admin") return true

  // Clients don't have granular permissions (they own their sites)
  if (userPerms.role === "client") return true

  return userPerms.permissions.some(
    (p) => p.module === module && p.action === action
  )
}

/**
 * Check if a user has ANY of the listed permissions
 */
export async function hasAnyPermission(
  userId: string,
  perms: Array<{ module: string; action: string }>
): Promise<boolean> {
  const userPerms = await getUserPermissions(userId)

  if (userPerms.role === "super_admin") return true
  if (userPerms.role === "client") return true

  return perms.some((perm) =>
    userPerms.permissions.some(
      (p) => p.module === perm.module && p.action === perm.action
    )
  )
}

/**
 * Check if user has ALL of the listed permissions
 */
export async function hasAllPermissions(
  userId: string,
  perms: Array<{ module: string; action: string }>
): Promise<boolean> {
  const userPerms = await getUserPermissions(userId)

  if (userPerms.role === "super_admin") return true
  if (userPerms.role === "client") {
    // Clients don't have granular RBAC — return true only if perms is empty
    return perms.length === 0
  }

  return perms.every((perm) =>
    userPerms.permissions.some(
      (p) => p.module === perm.module && p.action === perm.action
    )
  )
}

/**
 * Server-side helper: get user with permissions for use in layouts/API routes
 */
export async function getServerUserWithPermissions(session: {
  user: { id: string; role: string; email?: string }
}): Promise<UserPermissions | null> {
  if (!session?.user?.id) return null
  return getUserPermissions(session.user.id)
}

/**
 * Create a permissions map from array for fast lookup
 * Key format: "module:action"
 */
export function createPermissionMap(
  perms: PermissionEntry[]
): Map<string, boolean> {
  const map = new Map<string, boolean>()
  for (const p of perms) {
    map.set(`${p.module}:${p.action}`, true)
  }
  return map
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
 * Employees need at least one permission
 */
export function canAccessDashboard(role: string, permissionsCount?: number): boolean {
  if (role === "super_admin" || role === "client") return true
  if (role === "employee") return (permissionsCount ?? 0) > 0
  return false
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
