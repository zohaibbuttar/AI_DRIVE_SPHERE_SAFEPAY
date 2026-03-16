import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("x-sfpy-signature") || ""
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET

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

  if (
    eventType === "payment:created" ||
    eventType === "payment:success" ||
    event?.payload?.state === "PAID"
  ) {
    const trackerToken = event?.payload?.tracker?.token || event?.token
    const referenceNumber = event?.payload?.reference_number || event?.reference || trackerToken
    const orderId = event?.payload?.order_id || event?.order_id

    if (!trackerToken) {
      return NextResponse.json({ error: "No tracker token" }, { status: 400 })
    }

    let booking = null

    if (orderId) {
      const { data } = await supabase
        .from("bookings")
        .select("id, user_id, total_price")
        .eq("id", orderId)
        .single()
      booking = data
    }

    if (!booking && trackerToken) {
      const { data } = await supabase
        .from("bookings")
        .select("id, user_id, total_price")
        .eq("safepay_tracker_token", trackerToken)
        .maybeSingle()
      booking = data
    }

    if (booking) {
      await supabase
        .from("bookings")
        .update({ payment_status: "paid", status: "confirmed" })
        .eq("id", booking.id)

      await supabase.from("payments").upsert(
        {
          booking_id: booking.id,
          user_id: booking.user_id,
          safepay_tracker_token: trackerToken,
          safepay_reference_number: referenceNumber,
          amount: booking.total_price,
          currency: "pkr",
          status: "succeeded",
        },
        { onConflict: "safepay_tracker_token" }
      )
    }
  }

  if (eventType === "payment:failed" || event?.payload?.state === "FAILED") {
    const trackerToken = event?.payload?.tracker?.token || event?.token
    const orderId = event?.payload?.order_id || event?.order_id

    if (orderId) {
      await supabase
        .from("bookings")
        .update({ payment_status: "unpaid", status: "pending" })
        .eq("id", orderId)
    } else if (trackerToken) {
      await supabase
        .from("bookings")
        .update({ payment_status: "unpaid", status: "pending" })
        .eq("safepay_tracker_token", trackerToken)
    }
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}