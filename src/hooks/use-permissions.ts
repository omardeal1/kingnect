"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"

export function usePermissions() {
  const { data: session, status } = useSession()

  const permissionMap = useMemo(() => {
    const map = new Map<string, boolean>()
    if (!session?.user) return map

    // Super admins have all permissions
    if (session.user.role === "super_admin") {
      map.set("*", true)
      return map
    }

    // Clients don't use RBAC permissions (they own their sites)
    if (session.user.role === "client") {
      map.set("*", true)
      return map
    }

    const perms =
      (session.user.permissions as Array<{ module: string; action: string }> | undefined) ?? []
    for (const p of perms) {
      map.set(`${p.module}:${p.action}`, true)
    }

    return map
  }, [session])

  const has = (module: string, action: string): boolean => {
    if (permissionMap.has("*")) return true
    return permissionMap.has(`${module}:${action}`)
  }

  const hasAny = (...perms: Array<[string, string]>): boolean => {
    if (permissionMap.has("*")) return true
    return perms.some(([m, a]) => permissionMap.has(`${m}:${a}`))
  }

  const hasAll = (...perms: Array<[string, string]>): boolean => {
    if (permissionMap.has("*")) return true
    return perms.every(([m, a]) => permissionMap.has(`${m}:${a}`))
  }

  const isSuperAdmin = session?.user?.role === "super_admin"
  const isEmployee = !!session?.user?.employeeId
  const isClient = session?.user?.role === "client"

  return {
    has,
    hasAny,
    hasAll,
    isSuperAdmin,
    isEmployee,
    isClient,
    permissions: permissionMap,
    status,
  }
}
