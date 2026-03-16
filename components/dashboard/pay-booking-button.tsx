"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

type Props = {
  bookingId: string
  vehicleName: string
  totalPrice: number
  currency?: string
  startDate?: string
  endDate?: string
  days?: number
}

export function PayBookingButton({
  bookingId,
  vehicleName,
  totalPrice,
  currency = "PKR",
  startDate = "",
  endDate = "",
  days,
}: Props) {
  const router = useRouter()

  function handlePay() {
    const params = new URLSearchParams({
      bookingId,
      vehicleName,
      totalPrice: String(totalPrice),
      currency,
      startDate,
      endDate,
      days: String(days ?? ""),
    })
    router.push(`/dashboard/bookings/confirm-payment?${params.toString()}`)
  }

  return (
    <Button
      onClick={handlePay}
      size="sm"
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
    >
      <CreditCard className="h-4 w-4" />
      Pay {currency} {totalPrice.toLocaleString()}
    </Button>
  )
}
