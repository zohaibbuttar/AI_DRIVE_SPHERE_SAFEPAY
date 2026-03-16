import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Fetch recent IoT commands
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("iot_commands")
    .select("*, vehicles(name, plate_number)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST - Send IoT command to a vehicle
export async function POST(request: NextRequest) {
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

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }

  const body = await request.json()
  const { vehicle_id, command } = body

  if (!vehicle_id || !command) {
    return NextResponse.json(
      { error: "vehicle_id and command are required" },
      { status: 400 }
    )
  }

  const validCommands = ["lock", "unlock", "immobilize", "reactivate"]
  if (!validCommands.includes(command)) {
    return NextResponse.json(
      { error: `Invalid command. Valid: ${validCommands.join(", ")}` },
      { status: 400 }
    )
  }

  // Fetch vehicle to get IoT device ID
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("iot_device_id")
    .eq("id", vehicle_id)
    .single()

  if (!vehicle?.iot_device_id) {
    return NextResponse.json(
      { error: "Vehicle has no IoT device configured" },
      { status: 400 }
    )
  }

  // Log the command
  const { data: iotCommand, error } = await supabase
    .from("iot_commands")
    .insert({
      vehicle_id,
      command,
      issued_by: user.id,
      status: "sent",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // In production, publish to MQTT broker:
  // const mqtt = require('mqtt')
  // const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
  //   username: process.env.MQTT_USERNAME,
  //   password: process.env.MQTT_PASSWORD,
  // })
  // client.publish(`vehicles/${vehicle.iot_device_id}/commands`, JSON.stringify({
  //   command,
  //   command_id: iotCommand.id,
  //   timestamp: new Date().toISOString(),
  // }))

  return NextResponse.json(iotCommand, { status: 201 })
}
