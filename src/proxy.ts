import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAILS = [
  'yamikanitambala@gmail.com',
  'yankhojchigaru@gmail.com'
]

// CHANGE: Rename from "middleware" to "proxy"
export function proxy(req: NextRequest) {
  // Get all cookies to check
  const cookies = req.cookies.getAll()
  
  // Supabase stores auth in various cookie formats. Check for any auth-related cookies
  const hasAuthCookie = cookies.some(cookie => {
    const name = cookie.name.toLowerCase()
    return (
      name.includes('sb-') || // Supabase cookies
      name.includes('auth') || // Generic auth cookies
      name.includes('token') || // Token cookies
      name.includes('session') // Session cookies
    )
  })
  
  // Also check for the specific cookie format Supabase uses
  // Supabase creates cookies like: sb-<project-id>-auth-token
  const supabaseCookies = cookies.filter(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('auth')
  )
  
  const isAuthenticated = hasAuthCookie || supabaseCookies.length > 0
  
  console.log('Proxy check:', {
    path: req.nextUrl.pathname,
    cookiesFound: cookies.map(c => c.name),
    supabaseCookies: supabaseCookies.map(c => c.name),
    isAuthenticated,
  })

  // If trying to access login page but already authenticated
  if (isAuthenticated && req.nextUrl.pathname === '/auth/login') {
    console.log('Already authenticated, redirecting from login')
    
    // Try to find user email in cookies
    let userEmail = ''
    const emailCookie = cookies.find(c => 
      c.name.includes('email') || c.value.includes('@')
    )
    if (emailCookie) {
      userEmail = emailCookie.value
    }
    
    const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail.toLowerCase()) : false
    return NextResponse.redirect(
      new URL(isAdmin ? '/admin/dashboard' : '/client/dashboard', req.url)
    )
  }

  // Redirect unauthenticated users from protected routes
  // BUT allow access in development for testing
  if (!isAuthenticated && 
      (req.nextUrl.pathname.startsWith('/client') || 
       req.nextUrl.pathname.startsWith('/admin'))) {
    
    // In development, allow access but log warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('Development: Allowing access without auth cookies to:', req.nextUrl.pathname)
      return NextResponse.next()
    }
    
    console.log('Not authenticated, redirecting to login')
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/client/:path*', '/admin/:path*', '/auth/login'],
}