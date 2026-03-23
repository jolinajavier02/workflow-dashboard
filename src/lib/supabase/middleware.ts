import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // DEMO MODE: Bypass auth for placeholder environment
  const isPlaceholder = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'placeholder').includes('placeholder')
  if (isPlaceholder) {
    return response
  }

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Role-based protection check can happen here or inside components
    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Create profile if missing? For now, just sign out or redirect
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Example role check: admin only for /dashboard/admin
    if (url.pathname.startsWith('/dashboard/admin') && profile.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if (url.pathname.startsWith('/dashboard/tracker') && profile.role !== 'SALES_MANAGER' && profile.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect from login if already logged in
  if (url.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
