"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  bookingId: string
  vehicleName: string
  totalPrice: number
  currency?: string
}

export function PayBookingButton({ bookingId, vehicleName, totalPrice, currency = "PKR" }: Props) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, vehicleName, totalPrice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      // Redirect to Safepay checkout
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message || "Could not initiate payment")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      size="sm"
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
      ) : (
        <><CreditCard className="h-4 w-4" /> Pay {currency} {totalPrice.toLocaleString()}</>
      )}
    </Button>
  )
}
