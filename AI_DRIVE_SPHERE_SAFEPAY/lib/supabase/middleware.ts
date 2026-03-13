import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * OPTIMIZED middleware for /admin routes only
 * 
 * Workflow:
 * 1. Update session from cookies (refresh tokens)
 * 2. Check if user exists
 * 3. If no user → redirect to /auth/login
 * 4. If user exists → check admin role via RLS
 * 5. If not admin → redirect to /dashboard
 * 6. Admin access → continue
 * 
 * Performance notes:
 * - Only runs on /admin/* paths (matcher restricts execution)
 * - Single profile query with role check
 * - RLS policies enforce security server-side
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check session from cookies only (no getUser() call needed for refresh)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // No session → redirect to login
    console.warn("[auth] No session found for admin route, redirecting to login")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // User exists → fetch profile to verify admin role
  // This is the ONLY profile query for admin routes
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    console.warn("[auth] Profile not found for user:", user.id)
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (profile.role !== "admin") {
    // Not admin → redirect to dashboard
    console.warn("[auth] User is not admin, redirecting to dashboard")
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Admin access granted → continue
  return supabaseResponse
}
