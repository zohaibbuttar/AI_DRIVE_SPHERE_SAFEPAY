import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// ─── Safepay Payment Gateway (Pakistan) ───────────────────────────────────────
// Docs: https://getsafepay.com/documentation
// Sign up at: https://getsafepay.pk to get your API keys
// Supports: Debit/Credit Cards, JazzCash, Easypaisa, Bank Transfers (PKR)
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { bookingId, vehicleName, totalPrice } = await request.json()

  if (!bookingId || !vehicleName || !totalPrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const safepayKey = process.env.SAFEPAY_SECRET_KEY
  if (!safepayKey) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    // Step 1: Create a payment session (tracker) with Safepay
    const sessionRes = await fetch("https://sandbox.api.getsafepay.com/order/v1/init/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SFPY-MERCHANT-SECRET": safepayKey,
      },
      body: JSON.stringify({
        merchant_api_key: process.env.SAFEPAY_PUBLIC_KEY,
        purpose: `Car Rental: ${vehicleName}`,
        amount: Math.round(totalPrice * 100), // amount in paisa (PKR cents)
        currency: "PKR",
        order_id: bookingId,
        // Webhook will fire when payment completes
        webhooks: {
          payment_success: `${appUrl}/api/payments/webhook`,
          payment_failed: `${appUrl}/api/payments/webhook`,
        },
      }),
    })

    const sessionData = await sessionRes.json()

    if (!sessionRes.ok || !sessionData?.data?.tracker?.token) {
      console.error("Safepay session error:", sessionData)
      return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
    }

    const trackerToken = sessionData.data.tracker.token

    // Step 2: Build the Safepay checkout URL
    const checkoutUrl = new URL("https://sandbox.getsafepay.com/checkout/pay/")
    checkoutUrl.searchParams.set("env", "sandbox")
    checkoutUrl.searchParams.set("token", trackerToken)
    checkoutUrl.searchParams.set("orderId", bookingId)
    checkoutUrl.searchParams.set("cancelUrl", `${appUrl}/dashboard/bookings?cancelled=true`)
    checkoutUrl.searchParams.set("redirectUrl", `${appUrl}/dashboard/bookings?success=true`)

    // Step 3: Save tracker token to booking for webhook matching
    await supabase.from("bookings").update({
      stripe_session_id: trackerToken, // reusing column for tracker token
      payment_status: "unpaid",
    }).eq("id", bookingId)

    return NextResponse.json({ url: checkoutUrl.toString(), trackerToken })
  } catch (err: any) {
    console.error("Payment error:", err)
    return NextResponse.json({ error: err.message || "Payment failed" }, { status: 500 })
  }
}
