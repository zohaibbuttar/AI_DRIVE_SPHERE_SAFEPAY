import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { bookingId, totalPrice } = await request.json()

  if (!bookingId || !totalPrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const secretKey = process.env.SAFEPAY_SECRET_KEY!
  const publicKey = process.env.SAFEPAY_PUBLIC_KEY!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const BASE = "https://sandbox.api.getsafepay.com"

  try {
    // STEP 1: Create tracker (v1 — confirmed working for this account)
    const sessionRes = await fetch(`${BASE}/order/v1/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SFPY-MERCHANT-SECRET": secretKey,
      },
      body: JSON.stringify({
        client: publicKey,
        amount: Number(totalPrice),
        currency: "PKR",
        environment: "sandbox",
      }),
    })

    const sessionText = await sessionRes.text()
    console.log("[safepay] tracker status:", sessionRes.status)
    console.log("[safepay] tracker body:", sessionText.slice(0, 400))

    let sessionData: any
    try { sessionData = JSON.parse(sessionText) } catch {
      return NextResponse.json({ error: `Safepay non-JSON: ${sessionText.slice(0, 200)}` }, { status: 502 })
    }

    if (!sessionRes.ok) {
      return NextResponse.json({ error: sessionData?.status?.errors?.[0] || "Tracker creation failed" }, { status: 502 })
    }

    const trackerToken = sessionData?.data?.token
    if (!trackerToken) {
      return NextResponse.json({ error: "No tracker token returned" }, { status: 502 })
    }
    console.log("[safepay] ✅ tracker:", trackerToken)

    // STEP 2: Get auth token (tbt)
    const authRes = await fetch(`${BASE}/client/passport/v1/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SFPY-MERCHANT-SECRET": secretKey,
      },
      body: JSON.stringify({}),
    })

    const authText = await authRes.text()
    console.log("[safepay] auth status:", authRes.status)

    let authData: any
    try { authData = JSON.parse(authText) } catch {
      return NextResponse.json({ error: `Auth token non-JSON: ${authText.slice(0, 200)}` }, { status: 502 })
    }

    if (!authRes.ok) {
      return NextResponse.json({ error: authData?.status?.errors?.[0] || "Auth token failed" }, { status: 502 })
    }

    const tbt = authData?.data
    if (!tbt || typeof tbt !== "string") {
      return NextResponse.json({ error: "No tbt token returned" }, { status: 502 })
    }
    console.log("[safepay] ✅ tbt received")

    // STEP 3: Build checkout URL
    const params = new URLSearchParams({
      env: "sandbox",
      beacon: trackerToken,
      tbt: tbt,
      source: "hosted",
      redirect_url: `${appUrl}/dashboard/bookings?success=true`,
      cancel_url: `${appUrl}/dashboard/bookings?cancelled=true`,
    })

    const checkoutUrl = `${BASE}/checkout?${params.toString()}`
    console.log("[safepay] ✅ checkout URL ready")

    // Save tracker to booking (non-fatal)
    try {
      await supabase
        .from("bookings")
        .update({ safepay_tracker_token: trackerToken, payment_status: "unpaid" })
        .eq("id", bookingId)
    } catch (_) {}

    return NextResponse.json({ url: checkoutUrl, tracker_token: trackerToken })

  } catch (err: any) {
    console.error("[safepay] error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
