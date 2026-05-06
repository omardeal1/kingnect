// ─── Product Limits Helper ──────────────────────────────────────────────────
// Checks product/menu item limits based on the client's subscription plan.
// Used by API routes before creating new items to enforce plan limits.

import { db } from "@/lib/db"

interface PlanLimits {
  maxProducts: number // -1 = unlimited
  maxMenuItems: number // -1 = unlimited
  maxBranches: number // -1 = unlimited
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
                  maxProducts: true,
                  maxMenuItems: true,
                  maxBranches: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!site?.client?.subscription?.plan) {
    return { maxProducts: -1, maxMenuItems: -1, maxBranches: -1 }
  }

  return {
    maxProducts: site.client.subscription.plan.maxProducts ?? -1,
    maxMenuItems: site.client.subscription.plan.maxMenuItems ?? -1,
    maxBranches: site.client.subscription.plan.maxBranches ?? -1,
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
