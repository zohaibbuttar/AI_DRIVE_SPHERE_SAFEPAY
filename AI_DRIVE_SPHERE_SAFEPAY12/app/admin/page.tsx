import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, CalendarDays, FileText, Users, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: totalVehicles } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })

  const { count: availableVehicles } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })

  const { count: pendingBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .in("status", ["active", "confirmed"])

  const { data: revenueData } = await supabase
    .from("bookings")
    .select("total_price")
    .in("status", ["active", "completed", "confirmed"])

  const totalRevenue = revenueData?.reduce(
    (sum: number, b: any) => sum + Number(b.total_price),
    0
  ) || 0

  const { data: recentBookings } = await supabase
    .from("bookings")
    .select("*, vehicles(name), profiles:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    { title: "Total Vehicles", value: totalVehicles ?? 0, icon: Car, color: "text-accent" },
    { title: "Available", value: availableVehicles ?? 0, icon: Car, color: "text-green-600" },
    { title: "Total Bookings", value: totalBookings ?? 0, icon: CalendarDays, color: "text-accent" },
    { title: "Pending", value: pendingBookings ?? 0, icon: CalendarDays, color: "text-yellow-600" },
    { title: "Active Rentals", value: activeBookings ?? 0, icon: Users, color: "text-blue-600" },
    { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fleet management overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg">Recent Bookings</CardTitle>
          <Link href="/admin/bookings" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No bookings yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-card-foreground">
                      {booking.vehicles?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {booking.profiles?.full_name || "Customer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-card-foreground">
                      ${booking.total_price}
                    </p>
                    <Badge
                      variant={
                        booking.status === "pending"
                          ? "outline"
                          : booking.status === "active"
                            ? "default"
                            : booking.status === "cancelled"
                              ? "destructive"
                              : "secondary"
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
