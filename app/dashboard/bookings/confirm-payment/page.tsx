"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { CreditCard, Car, Calendar, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function ConfirmPaymentContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const bookingId = params.get("bookingId") || ""
  const vehicleName = params.get("vehicleName") || "Vehicle"
  const totalPrice = Number(params.get("totalPrice") || 0)
  const currency = params.get("currency") || "PKR"
  const startDate = params.get("startDate") || ""
  const endDate = params.get("endDate") || ""
  const days = params.get("days") || ""

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, vehicleName, totalPrice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      if (!data.url) throw new Error("No checkout URL returned")
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message || "Could not initiate payment")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gray-900 text-white p-6 text-center">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">Confirm Payment</h1>
          <p className="text-gray-400 text-sm mt-1">Review your booking before paying</p>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-4">

          {/* Vehicle */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
              <p className="font-semibold text-gray-900">{vehicleName}</p>
            </div>
          </div>

          {/* Dates */}
          {startDate && endDate && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Rental Period</p>
                <p className="font-semibold text-gray-900">{startDate} → {endDate}</p>
                {days && <p className="text-sm text-gray-500">{days} day{Number(days) !== 1 ? "s" : ""}</p>}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Amount */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-1">Total Amount Payable</p>
            <p className="text-5xl font-bold text-gray-900">
              {currency} {totalPrice.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">Secure payment via Safepay</p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Booking ID */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono text-gray-700 text-xs">{bookingId.slice(0, 16)}...</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard/bookings")}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" /> Pay {currency} {totalPrice.toLocaleString()}</>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-2">
            🔒 You will be redirected to Safepay's secure payment page
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmPaymentContent />
    </Suspense>
  )
}
