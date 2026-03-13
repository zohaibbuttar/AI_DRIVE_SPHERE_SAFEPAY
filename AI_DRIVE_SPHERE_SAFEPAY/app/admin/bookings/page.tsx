import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { AdminBookingActions } from "@/components/admin/admin-booking-actions"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  active: "default",
  completed: "secondary",
  cancelled: "destructive",
}

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, vehicles(name, plate_number), profiles:user_id(full_name, phone)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Booking Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage all customer bookings
        </p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id}>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg font-bold text-card-foreground">
                      {booking.vehicles?.name}
                    </h3>
                    <Badge variant={statusColors[booking.status] || "outline"}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: {booking.profiles?.full_name || "N/A"} |{" "}
                    {booking.profiles?.phone || "No phone"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.vehicles?.plate_number} |{" "}
                    {new Date(booking.start_date).toLocaleDateString()} -{" "}
                    {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                  {booking.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      Note: {booking.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-card-foreground">
                    ${booking.total_price}
                  </p>
                  <AdminBookingActions
                    bookingId={booking.id}
                    currentStatus={booking.status}
                    vehicleId={booking.vehicle_id}
                    userId={booking.user_id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
