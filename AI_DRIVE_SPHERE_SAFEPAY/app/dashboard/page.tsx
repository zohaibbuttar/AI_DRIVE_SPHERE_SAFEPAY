import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, CalendarDays, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, vehicles(name, type, image_url)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .in("status", ["active", "confirmed"])

  const { count: totalAgreements } = await supabase
    .from("agreements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings ?? 0,
      icon: CalendarDays,
    },
    {
      title: "Active Rentals",
      value: activeBookings ?? 0,
      icon: Car,
    },
    {
      title: "Agreements",
      value: totalAgreements ?? 0,
      icon: FileText,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your rental activity at a glance
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg">Recent Bookings</CardTitle>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No bookings yet.{" "}
                <Link href="/dashboard/vehicles" className="text-accent hover:underline">
                  Browse vehicles
                </Link>{" "}
                to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-card-foreground">
                      {booking.vehicles?.name || "Vehicle"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.start_date).toLocaleDateString()} -{" "}
                      {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-card-foreground">
                      ${booking.total_price}
                    </p>
                    <Badge
                      variant={
                        booking.status === "active"
                          ? "default"
                          : booking.status === "confirmed"
                            ? "secondary"
                            : booking.status === "cancelled"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
