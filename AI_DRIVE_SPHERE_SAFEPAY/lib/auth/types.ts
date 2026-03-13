/**
 * User Role Types
 */
export type UserRole = "admin" | "customer"

export interface UserProfile {
  id: string
  full_name: string
  phone: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile
}
