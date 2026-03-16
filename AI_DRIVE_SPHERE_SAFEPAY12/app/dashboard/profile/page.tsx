"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useSWR from "swr"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const { data: profile, mutate } = useSWR("profile", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    return { ...data, email: user.email }
  })

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setPhone(profile.phone || "")
    }
  }, [profile])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Not authenticated")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Profile updated!")
      mutate()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="rounded-lg border border-input bg-muted px-4 py-2.5 text-sm text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">Role</label>
              <input
                type="text"
                value={profile?.role || "customer"}
                disabled
                className="rounded-lg border border-input bg-muted px-4 py-2.5 text-sm text-muted-foreground capitalize"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
