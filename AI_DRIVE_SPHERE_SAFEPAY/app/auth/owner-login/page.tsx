"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PasswordToggleInput } from "@/components/auth/password-toggle-input"
import { toast } from "sonner"

export default function OwnerLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Check user role and ensure they are admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profile?.role !== "admin") {
      // Log out the user since they're not an admin
      await supabase.auth.signOut()
      toast.error("Access denied. Owner account required.")
      setLoading(false)
      return
    }

    // Admin can proceed to admin dashboard
    router.push("/admin")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-foreground/40" aria-hidden="true" />

      {/* Login card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-card p-10 shadow-2xl">
        {/* Back to home button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 group"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <h1 className="font-serif text-3xl font-bold text-card-foreground italic">
          Owner Login
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your owner account
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-card-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="owner@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <PasswordToggleInput
            id="password"
            placeholder="••••••••"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In to Owner Portal"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Looking for renter portal?
          </p>
          <Link
            href="/auth/login"
            className="mt-1 inline-block text-sm font-bold text-card-foreground hover:text-accent transition-colors"
          >
            Sign In as Renter
          </Link>
        </div>
      </div>
    </div>
  )
}
