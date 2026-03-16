import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

// ─── Safepay Webhook Handler ──────────────────────────────────────────────────
// Safepay POSTs payment events here.
// Set this URL in your Safepay dashboard → Settings → Webhooks:
// https://yourdomain.com/api/payments/webhook
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("x-sfpy-signature") || ""
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET

  // Verify webhook signature (recommended for production)
  if (webhookSecret) {
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const supabase = await createClient()
  const eventType = event?.type || event?.notification_type

  // payment:created or payment:success
  if (eventType === "payment:created" || eventType === "payment:success" || event?.payload?.state === "PAID") {
    const trackerToken = event?.payload?.tracker?.token || event?.token
    const referenceNumber = event?.payload?.reference_number || event?.reference

    if (!trackerToken) {
      return NextResponse.json({ error: "No tracker token" }, { status: 400 })
    }

    // Find booking by tracker token (stored in stripe_session_id column)
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, user_id, total_price")
      .eq("stripe_session_id", trackerToken)
      .single()

    if (booking) {
      // Update booking status
      await supabase.from("bookings").update({
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: referenceNumber || trackerToken,
      }).eq("id", booking.id)

      // Record in payments table
      await supabase.from("payments").insert({
        booking_id: booking.id,
        user_id: booking.user_id,
        stripe_payment_intent_id: referenceNumber || trackerToken,
        stripe_session_id: trackerToken,
        amount: booking.total_price,
        currency: "pkr",
        status: "succeeded",
      }).onConflict("stripe_payment_intent_id").ignore()
    }
  }

  // payment:failed
  if (eventType === "payment:failed" || event?.payload?.state === "FAILED") {
    const trackerToken = event?.payload?.tracker?.token || event?.token
    if (trackerToken) {
      await supabase.from("bookings")
        .update({ payment_status: "unpaid", status: "pending" })
        .eq("stripe_session_id", trackerToken)
    }
  }

  return NextResponse.json({ received: true })
}

// GET for webhook verification (Safepay pings this on setup)
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}
