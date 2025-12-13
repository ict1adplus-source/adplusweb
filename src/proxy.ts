// src/proxy.ts (or root/proxy.ts)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Make sure this is a named export called "proxy"
export function proxy(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname
  
  console.log('Proxy running for:', pathname)
  
  // Basic authentication check
  const hasAuth = request.cookies.get('sb-auth-token') || 
                  request.cookies.get('supabase-auth-token')
  
  // Protect admin routes
  if (pathname.startsWith('/admin') && !hasAuth) {
    console.log('Redirecting to login from:', pathname)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // If already authenticated and trying to access login, redirect to dashboard
  if (hasAuth && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Optional: Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}