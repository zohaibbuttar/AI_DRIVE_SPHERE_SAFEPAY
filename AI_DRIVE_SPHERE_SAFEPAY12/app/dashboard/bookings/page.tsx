import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { CancelBookingButton } from "@/components/dashboard/cancel-booking-button"
import { PayBookingButton } from "@/components/dashboard/pay-booking-button"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  active: "default",
  completed: "secondary",
  cancelled: "destructive",
}

const paymentColors: Record<string, string> = {
  unpaid: "text-amber-500",
  paid: "text-green-400",
  refunded: "text-blue-400",
}

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check for success/cancelled query params handled by layout or toast
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, vehicles(name, type, plate_number, image_url)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage all your vehicle rentals</p>
        </div>
        <Link
          href="/dashboard/vehicles"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Booking
        </Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No bookings yet.{" "}
              <Link href="/dashboard/vehicles" className="text-accent hover:underline">
                Browse vehicles
              </Link>{" "}
              to make your first booking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking: any) => {
            const needsPayment = booking.status === "pending" && booking.payment_status === "unpaid"
            const isPaid = booking.payment_status === "paid"
            return (
              <Card key={booking.id} className={needsPayment ? "border-amber-500/30" : ""}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-serif text-lg font-bold text-card-foreground">
                        {booking.vehicles?.name || "Vehicle"}
                      </h3>
                      <Badge variant={statusColors[booking.status] || "outline"}>{booking.status}</Badge>
                      {isPaid && (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                        </span>
                      )}
                      {needsPayment && (
                        <span className="text-xs text-amber-500 font-medium animate-pulse">
                          ⚠️ Payment Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {booking.vehicles?.plate_number} · {booking.vehicles?.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.start_date).toLocaleDateString("en-PK", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric",
                      })}{" "}→{" "}
                      {new Date(booking.end_date).toLocaleDateString("en-PK", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                    {booking.notes && (
                      <p className="mt-1 text-xs text-muted-foreground italic">{booking.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <p className="text-xl font-bold text-card-foreground">
                        PKR {Number(booking.total_price).toLocaleString()}
                      </p>
                      <p className={`text-xs font-medium ${paymentColors[booking.payment_status] || "text-muted-foreground"}`}>
                        {booking.payment_status || "unpaid"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* Safepay Payment Button */}
                      {needsPayment && (
                        <PayBookingButton
                          bookingId={booking.id}
                          vehicleName={booking.vehicles?.name || "Vehicle"}
                          totalPrice={Number(booking.total_price)}
                        />
                      )}
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <CancelBookingButton bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
