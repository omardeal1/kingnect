import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const pathname = req.nextUrl.pathname

      // Admin routes - only super_admin
      if (pathname.startsWith("/admin")) {
        return token?.role === "super_admin"
      }

      // Dashboard routes - any authenticated user
      if (pathname.startsWith("/dashboard")) {
        return !!token
      }

      // Auth pages - redirect to dashboard if already logged in
      if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
        if (token) {
          // Return true to allow, the redirect will be handled client-side
          return true
        }
        return true
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
}
