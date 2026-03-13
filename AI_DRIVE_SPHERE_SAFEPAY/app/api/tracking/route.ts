import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Fetch vehicle locations (for customers: only active bookings, for admin: all)
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "admin") {
    // Admin sees all vehicles with GPS data
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, name, plate_number, status, latitude, longitude, gps_device_id")
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } else {
    // Customer sees only their active booking vehicles
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("vehicles(id, name, plate_number, latitude, longitude)")
      .eq("user_id", user.id)
      .in("status", ["active", "confirmed"])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const vehicles = bookings
      ?.map((b: any) => b.vehicles)
      .filter((v: any) => v?.latitude != null && v?.longitude != null)

    return NextResponse.json(vehicles || [])
  }
}

// POST - Receive GPS data from IoT device (webhook endpoint)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { vehicle_id, latitude, longitude } = body

  if (!vehicle_id || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "vehicle_id, latitude, and longitude are required" },
      { status: 400 }
    )
  }

  // Update vehicle location
  const { error: vehicleError } = await supabase
    .from("vehicles")
    .update({
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicle_id)

  if (vehicleError) {
    return NextResponse.json({ error: vehicleError.message }, { status: 500 })
  }

  // Log to tracking history
  const { error: historyError } = await supabase
    .from("tracking_history")
    .insert({
      vehicle_id,
      latitude,
      longitude,
    })

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
