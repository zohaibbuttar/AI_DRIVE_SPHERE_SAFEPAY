import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSessionOnce } from "./session"
import type { UserProfile } from "./types"

/**
 * Server-side helper to require admin access
 * Uses session cache to prevent duplicate fetches
 *
 * Usage in admin pages:
 * export default async function AdminPage() {
 *   const profile = await requireAdmin()
 *   // Profile is guaranteed to have role === "admin"
 * }
 * 
 * Performance:
 * - Uses cached session if available in same request
 * - Single auth.getUser() + single profile query max
 * - Middleware already verified admin role
 */
export async function requireAdmin(): Promise<UserProfile> {
  // Use cached session to avoid repeated fetches
  const session = await getSessionOnce()

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  const profile = session.profile

  if (!profile) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (profile.role !== "admin") {
    redirect("/dashboard")
  }

  return profile as UserProfile
}

/**
 * Get current user and profile (no role check)
 * Uses session cache to prevent duplicate fetches
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  // Use cached session
  const session = await getSessionOnce()

  if (!session) {
    return null
  }

  return session
}
