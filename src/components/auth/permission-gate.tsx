"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { useSession } from "next-auth/react"

interface PermissionGateProps {
  module: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Conditionally renders children only if the current user has the specified permission.
 * Super admins and clients always pass (they don't use granular RBAC).
 */
export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { has, status } = usePermissions()

  if (status === "loading") return null
  if (has(module, action)) return <>{children}</>
  return <>{fallback}</>
}

interface AnyPermissionGateProps {
  permissions: Array<[string, string]>
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Renders children if the user has ANY of the listed permissions.
 */
export function AnyPermissionGate({
  permissions,
  children,
  fallback = null,
}: AnyPermissionGateProps) {
  const { hasAny, status } = usePermissions()

  if (status === "loading") return null
  if (hasAny(...permissions)) return <>{children}</>
  return <>{fallback}</>
}

interface AllPermissionsGateProps {
  permissions: Array<[string, string]>
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Renders children if the user has ALL of the listed permissions.
 */
export function AllPermissionsGate({
  permissions,
  children,
  fallback = null,
}: AllPermissionsGateProps) {
  const { hasAll, status } = usePermissions()

  if (status === "loading") return null
  if (hasAll(...permissions)) return <>{children}</>
  return <>{fallback}</>
}

interface RoleGateProps {
  roles: Array<string>
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Renders children if the current user's role is in the allowed list.
 */
export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { data: session, status } = useSession()

  if (status === "loading") return null
  if (session?.user?.role && roles.includes(session.user.role)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}
