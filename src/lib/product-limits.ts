// ─── Product Limits Helper ──────────────────────────────────────────────────
// Checks product/menu item limits based on the client's subscription plan.
// Used by API routes before creating new items to enforce plan limits.

import { db } from "@/lib/db"

interface PlanLimits {
  maxProducts: number // -1 = unlimited
  maxMenuItems: number // -1 = unlimited
  maxBranches: number // -1 = unlimited
  aiDailyLimit: number // -1 = unlimited
}

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  unlimited: boolean
  message?: string
}

/**
 * Get the plan limits for a given mini-site.
 * Falls back to unlimited (-1) if no plan is found.
 * Custom limits from the subscription override plan defaults.
 */
export async function getPlanLimits(siteId: string): Promise<PlanLimits> {
  const site = await db.miniSite.findUnique({
    where: { id: siteId },
    select: {
      clientId: true,
      client: {
        select: {
          subscription: {
            select: {
              plan: {
                select: {
                  limits: true,
                },
              },
              customLimits: true,
            },
          },
        },
      },
    },
  })

  const defaultLimits: PlanLimits = { maxProducts: -1, maxMenuItems: -1, maxBranches: -1, aiDailyLimit: -1 }

  if (!site?.client?.subscription?.plan) {
    return defaultLimits
  }

  // Parse plan limits from JSON string
  let parsedPlanLimits: Partial<PlanLimits> = {}
  try {
    const raw = site.client.subscription.plan.limits
    if (typeof raw === 'string') {
      parsedPlanLimits = JSON.parse(raw)
    } else if (raw) {
      parsedPlanLimits = raw as Partial<PlanLimits>
    }
  } catch { /* ignore */ }

  const planLimits: PlanLimits = {
    maxProducts: (parsedPlanLimits as Record<string, unknown>).maxMenuCategories != null
      ? ((parsedPlanLimits as Record<string, unknown>).maxMenuCategories as number)
      : (parsedPlanLimits.maxProducts ?? -1),
    maxMenuItems: parsedPlanLimits.maxMenuItems ?? -1,
    maxBranches: (parsedPlanLimits as Record<string, unknown>).maxLocations != null
      ? ((parsedPlanLimits as Record<string, unknown>).maxLocations as number)
      : (parsedPlanLimits.maxBranches ?? -1),
    aiDailyLimit: parsedPlanLimits.aiDailyLimit ?? -1,
  }

  // Apply per-client custom limits overrides (if set)
  const customLimitsJson = site.client.subscription.customLimits ?? "{}"
  try {
    const custom: Partial<PlanLimits> = JSON.parse(customLimitsJson)
    return {
      maxProducts: custom.maxProducts !== undefined ? custom.maxProducts : planLimits.maxProducts,
      maxMenuItems: custom.maxMenuItems !== undefined ? custom.maxMenuItems : planLimits.maxMenuItems,
      maxBranches: custom.maxBranches !== undefined ? custom.maxBranches : planLimits.maxBranches,
      aiDailyLimit: custom.aiDailyLimit !== undefined ? custom.aiDailyLimit : planLimits.aiDailyLimit,
    }
  } catch {
    return planLimits
  }
}

/**
 * Check if a new menu item can be added based on plan limits.
 */
export async function checkMenuItemLimit(siteId: string): Promise<LimitCheckResult> {
  const limits = await getPlanLimits(siteId)

  if (limits.maxMenuItems === -1) {
    return { allowed: true, current: 0, limit: -1, unlimited: true }
  }

  const current = await db.menuItem.count({
    where: { miniSiteId: siteId },
  })

  const allowed = current < limits.maxMenuItems

  return {
    allowed,
    current,
    limit: limits.maxMenuItems,
    unlimited: false,
    message: allowed
      ? undefined
      : `Has alcanzado el límite de ${limits.maxMenuItems} productos en tu plan`,
  }
}

/**
 * Check if a new category can be added based on plan limits.
 */
export async function checkCategoryLimit(siteId: string): Promise<LimitCheckResult> {
  const limits = await getPlanLimits(siteId)

  if (limits.maxProducts === -1) {
    return { allowed: true, current: 0, limit: -1, unlimited: true }
  }

  const current = await db.menuCategory.count({
    where: { miniSiteId: siteId },
  })

  const allowed = current < limits.maxProducts

  return {
    allowed,
    current,
    limit: limits.maxProducts,
    unlimited: false,
    message: allowed
      ? undefined
      : `Has alcanzado el límite de ${limits.maxProducts} categorías en tu plan`,
  }
}

/**
 * Check if a new branch can be added based on plan limits.
 */
export async function checkBranchLimit(siteId: string): Promise<LimitCheckResult> {
  const limits = await getPlanLimits(siteId)

  if (limits.maxBranches === -1) {
    return { allowed: true, current: 0, limit: -1, unlimited: true }
  }

  const current = await db.branch.count({
    where: { siteId },
  })

  const allowed = current < limits.maxBranches

  return {
    allowed,
    current,
    limit: limits.maxBranches,
    unlimited: false,
    message: allowed
      ? undefined
      : `Has alcanzado el límite de ${limits.maxBranches} sucursales en tu plan`,
  }
}

/**
 * Parse custom limits JSON from a subscription.
 */
export function parseCustomLimits(customLimitsJson: string | null | undefined): Partial<PlanLimits> {
  if (!customLimitsJson) return {}
  try {
    return JSON.parse(customLimitsJson)
  } catch {
    return {}
  }
}

/**
 * Get a summary of all current usage vs limits for a site.
 */
export async function getUsageSummary(siteId: string) {
  const limits = await getPlanLimits(siteId)
  const [menuItems, categories, branches] = await Promise.all([
    db.menuItem.count({ where: { miniSiteId: siteId } }),
    db.menuCategory.count({ where: { miniSiteId: siteId } }),
    db.branch.count({ where: { siteId } }),
  ])

  return {
    products: {
      current: menuItems,
      limit: limits.maxMenuItems,
      unlimited: limits.maxMenuItems === -1,
      percentage: limits.maxMenuItems === -1 ? 0 : Math.round((menuItems / limits.maxMenuItems) * 100),
    },
    categories: {
      current: categories,
      limit: limits.maxProducts,
      unlimited: limits.maxProducts === -1,
      percentage: limits.maxProducts === -1 ? 0 : Math.round((categories / limits.maxProducts) * 100),
    },
    branches: {
      current: branches,
      limit: limits.maxBranches,
      unlimited: limits.maxBranches === -1,
      percentage: limits.maxBranches === -1 ? 0 : Math.round((branches / limits.maxBranches) * 100),
    },
  }
}
