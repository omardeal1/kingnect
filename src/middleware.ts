import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple middleware that doesn't depend on next-auth withAuth
// which can cause runtime errors in serverless environments
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies (next-auth-jwt)
  const token = request.cookies.get("next-auth.session-token")?.value
    || request.cookies.get("__Secure-next-auth.session-token")?.value

  // Protected routes - redirect to login if not authenticated
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
}
