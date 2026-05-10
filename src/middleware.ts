import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get JWT token for role and mustChangePassword
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Allow auth pages to be accessed freely
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/sites") ||
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/reservations") ||
    pathname.startsWith("/api/loyalty") ||
    pathname.startsWith("/api/registration") ||
    pathname.startsWith("/api/menu") ||
    pathname.startsWith("/api/qr") ||
    pathname.startsWith("/api/subscription") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/platform")
  ) {
    return NextResponse.next()
  }

  // Public site pages
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Protected routes - check for auth
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Force password change redirect
  if (
    token.mustChangePassword === true &&
    !pathname.startsWith("/change-password")
  ) {
    const changePasswordUrl = new URL("/change-password", request.url)
    changePasswordUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(changePasswordUrl)
  }

  // Role-based route protection for /admin
  if (pathname.startsWith("/admin")) {
    if (token.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Dashboard access: super_admin and client always have access
  // Employees need at least one permission
  if (pathname.startsWith("/dashboard")) {
    if (token.role !== "super_admin" && token.role !== "client") {
      const perms = Array.isArray(token.permissions) ? token.permissions : []
      if (perms.length === 0) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/change-password/:path*",
  ],
}
