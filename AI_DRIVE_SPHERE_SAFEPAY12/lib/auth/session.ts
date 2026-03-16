import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "./types"

/**
 * Session cache for current request
 * Prevents multiple auth.getUser() calls per request
 * 
 * Usage in Server Components:
 * const session = await getSessionOnce()
 * if (!session) return <UnauthenticatedUI />
 * // Use session.user and session.profile safely
 */

// Cache key for request-scoped data
const CACHE_KEY = "_user_session_cache"

interface CachedSession {
  user: { id: string; email?: string } | null
  profile: UserProfile | null
  timestamp: number
}

// Global cache for this request (reset between requests automatically)
let requestCache: CachedSession | undefined

/**
 * Get current user session (cached per request)
 * Single call to auth.getUser() + single profile query
 */
export async function getSessionOnce(): Promise<{
  user: { id: string; email?: string } | null
  profile: UserProfile | null
} | null> {
  // Return cached result if available in this request
  if (requestCache) {
    return requestCache.user
      ? { user: requestCache.user, profile: requestCache.profile }
      : null
  }

  const supabase = await createClient()

  // Single getUser() call
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Cache null result
    requestCache = {
      user: null,
      profile: null,
      timestamp: Date.now(),
    }
    return null
  }

  // Single profile query
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Cache result
  requestCache = {
    user: { id: user.id, email: user.email },
    profile: (profile as UserProfile) || null,
    timestamp: Date.now(),
  }

  return { user: requestCache.user, profile: requestCache.profile }
}

/**
 * Clear session cache (called automatically between requests)
 * Can be called manually if needed
 */
export function clearSessionCache() {
  requestCache = undefined
}
