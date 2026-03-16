"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Vehicle = {
  id: string
  name: string
  price_per_day: number
}

export function BookingForm({
  vehicle,
  onSuccess,
}: {
  vehicle: Vehicle
  onSuccess: () => void
}) {
  const router = useRouter()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    return days > 0 ? days * vehicle.price_per_day : 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const total = calculateTotal()
    if (total <= 0) {
      toast.error("Please select valid dates")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("You must be logged in")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      vehicle_id: vehicle.id,
      start_date: startDate,
      end_date: endDate,
      total_price: total,
      notes: notes || null,
      status: "pending",
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Booking created successfully!")
    onSuccess()
    router.refresh()
  }

  const total = calculateTotal()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="startDate" className="text-sm font-semibold text-foreground">
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          min={new Date().toISOString().split("T")[0]}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="endDate" className="text-sm font-semibold text-foreground">
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          min={startDate || new Date().toISOString().split("T")[0]}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-sm font-semibold text-foreground">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requirements..."
          rows={3}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {total > 0 && (
        <div className="rounded-lg bg-secondary p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="text-lg font-bold text-foreground">${total.toFixed(2)}</span>
        </div>
      )}

      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Creating booking..." : "Confirm Booking"}
      </Button>
    </form>
  )
}
