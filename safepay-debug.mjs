const SECRET_KEY = "ff1c52ccbe28c493da5855439e7c3c82dc2d8cd97e7ffdb60cad5770a42c6114"
const PUBLIC_KEY = "sec_ede6de57-8830-4da9-9cb0-10d2bf536b37"
const BASE = "https://sandbox.api.getsafepay.com"

function divider(title) {
  console.log("\n" + "=".repeat(60))
  console.log("  " + title)
  console.log("=".repeat(60))
}

async function test(label, url, body) {
  divider(label)
  console.log("URL:", url)
  console.log("BODY:", JSON.stringify(body, null, 2))
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SFPY-MERCHANT-SECRET": SECRET_KEY,
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    console.log("\nHTTP STATUS:", res.status)
    console.log("\nRAW BODY:")
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2))
    } catch {
      console.log(text)
    }
    return { status: res.status, text }
  } catch (err) {
    console.log("\nNETWORK ERROR:", err.message)
    return null
  }
}

async function main() {
  console.log("SAFEPAY DIAGNOSTIC — " + new Date().toISOString())

  const t1 = await test(
    "TEST 1: OLD endpoint /order/v1/init",
    `${BASE}/order/v1/init`,
    { client: PUBLIC_KEY, amount: 10000, currency: "PKR", environment: "sandbox" }
  )

  const t2 = await test(
    "TEST 2: NEW endpoint /order/payments/v3/",
    `${BASE}/order/payments/v3/`,
    { merchant_api_key: PUBLIC_KEY, intent: "CYBERSOURCE", mode: "payment", currency: "PKR", amount: 1000000, metadata: { order_id: "test-123" } }
  )

  const t4 = await test(
    "TEST 3: Auth token /client/passport/v1/token",
    `${BASE}/client/passport/v1/token`,
    {}
  )

  divider("CHECKOUT URL")
  let trackerToken = null
  let tbt = null

  if (t2?.status === 200) {
    try { trackerToken = JSON.parse(t2.text)?.data?.tracker?.token; console.log("v3 tracker:", trackerToken) } catch {}
  }
  if (!trackerToken && t1?.status === 200) {
    try { trackerToken = JSON.parse(t1.text)?.data?.token; console.log("v1 tracker:", trackerToken) } catch {}
  }
  if (t4?.status === 200) {
    try { tbt = JSON.parse(t4.text)?.data; console.log("tbt (first 40):", String(tbt).slice(0,40)) } catch {}
  }

  if (trackerToken && tbt) {
    const params = new URLSearchParams({
      env: "sandbox", beacon: trackerToken, tbt: tbt, source: "hosted",
      redirect_url: "http://localhost:3000/dashboard/bookings?success=true",
      cancel_url: "http://localhost:3000/dashboard/bookings?cancelled=true",
    })
    console.log("\n✅ OPEN THIS URL IN YOUR BROWSER:")
    console.log(`${BASE}/checkout?${params.toString()}`)
  } else {
    console.log("❌ Could not build URL. trackerToken:", trackerToken, "tbt:", tbt ? "present" : "MISSING")
  }
}

main()
