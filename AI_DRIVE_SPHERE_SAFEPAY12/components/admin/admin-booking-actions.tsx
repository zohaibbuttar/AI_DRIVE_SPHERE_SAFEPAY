"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  MoreHorizontal,
  CheckCircle,
  Play,
  Square,
  XCircle,
  FileText,
} from "lucide-react"

export function AdminBookingActions({
  bookingId,
  currentStatus,
  vehicleId,
  userId,
}: {
  bookingId: string
  currentStatus: string
  vehicleId: string
  userId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId)

    if (error) {
      toast.error(error.message)
    } else {
      // If confirmed, update vehicle to rented
      if (status === "active") {
        await supabase
          .from("vehicles")
          .update({ status: "rented" })
          .eq("id", vehicleId)
      }
      // If completed or cancelled, set vehicle available
      if (status === "completed" || status === "cancelled") {
        await supabase
          .from("vehicles")
          .update({ status: "available" })
          .eq("id", vehicleId)
      }
      toast.success(`Booking ${status}`)
      router.refresh()
    }
    setLoading(false)
  }

  async function generateAgreement() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("agreements").insert({
      booking_id: bookingId,
      user_id: userId,
      vehicle_id: vehicleId,
      terms:
        "Standard rental agreement: The renter agrees to return the vehicle in the same condition as received. Insurance coverage included. Late returns subject to additional charges at the daily rate. Fuel should be returned at the same level.",
      status: "draft",
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Agreement generated!")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === "pending" && (
          <DropdownMenuItem onClick={() => updateStatus("confirmed")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm
          </DropdownMenuItem>
        )}
        {currentStatus === "confirmed" && (
          <DropdownMenuItem onClick={() => updateStatus("active")}>
            <Play className="mr-2 h-4 w-4" />
            Start Rental
          </DropdownMenuItem>
        )}
        {currentStatus === "active" && (
          <DropdownMenuItem onClick={() => updateStatus("completed")}>
            <Square className="mr-2 h-4 w-4" />
            Complete
          </DropdownMenuItem>
        )}
        {(currentStatus === "confirmed" || currentStatus === "active") && (
          <DropdownMenuItem onClick={generateAgreement}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Agreement
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {currentStatus !== "cancelled" && currentStatus !== "completed" && (
          <DropdownMenuItem
            onClick={() => updateStatus("cancelled")}
            className="text-destructive focus:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
