import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/auth/signin",
      "/auth/signup",
      "/auth/error",
      "/test-ui",
      "/api/health",
    ]

    // Check if it's a public route
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // API routes protection
    if (pathname.startsWith("/api/")) {
      // Public API routes
      const publicApiRoutes = [
        "/api/auth",
        "/api/health",
      ]

      if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
      }

      // Require authentication for other API routes
      if (!token) {
        return new NextResponse("Unauthorized", { status: 401 })
      }

      return NextResponse.next()
    }

    // Protected routes
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Role-based route protection
    if (pathname.startsWith("/business")) {
      if (token.role !== UserRole.BUSINESS_OWNER && token.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    if (pathname.startsWith("/admin")) {
      if (token.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow access to public routes without token
        const publicRoutes = [
          "/",
          "/auth/signin",
          "/auth/signup", 
          "/auth/error",
          "/test-ui",
          "/api/health",
          "/api/auth",
        ]

        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Require token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
