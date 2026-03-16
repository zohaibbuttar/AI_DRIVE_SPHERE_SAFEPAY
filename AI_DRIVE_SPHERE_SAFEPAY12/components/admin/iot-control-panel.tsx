"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Lock, Unlock, ShieldOff, ShieldCheck, Wifi } from "lucide-react"

type Vehicle = {
  id: string
  name: string
  plate_number: string
  status: string
  iot_device_id: string
}

const commands = [
  { command: "lock", label: "Lock", icon: Lock, color: "bg-blue-600 hover:bg-blue-700 text-white" },
  { command: "unlock", label: "Unlock", icon: Unlock, color: "bg-green-600 hover:bg-green-700 text-white" },
  { command: "immobilize", label: "Immobilize", icon: ShieldOff, color: "bg-red-600 hover:bg-red-700 text-white" },
  { command: "reactivate", label: "Reactivate", icon: ShieldCheck, color: "bg-amber-600 hover:bg-amber-700 text-white" },
]

export function IoTControlPanel({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  async function sendCommand(vehicleId: string, command: string) {
    const key = `${vehicleId}-${command}`
    setLoadingStates((prev) => ({ ...prev, [key]: true }))

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Not authenticated")
      setLoadingStates((prev) => ({ ...prev, [key]: false }))
      return
    }

    // Log the command in the database
    const { error } = await supabase.from("iot_commands").insert({
      vehicle_id: vehicleId,
      command,
      issued_by: user.id,
      status: "sent",
    })

    if (error) {
      toast.error(error.message)
    } else {
      // In production, this would publish to MQTT broker
      // mqtt.publish(`vehicles/${iot_device_id}/commands`, JSON.stringify({ command }))
      toast.success(
        `Command "${command}" sent successfully. In production, this publishes to the MQTT broker.`
      )
      router.refresh()
    }

    setLoadingStates((prev) => ({ ...prev, [key]: false }))
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-base">
                {vehicle.name}
              </CardTitle>
              <Badge
                variant={
                  vehicle.status === "available"
                    ? "default"
                    : vehicle.status === "rented"
                      ? "secondary"
                      : "destructive"
                }
              >
                {vehicle.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {vehicle.plate_number}
            </p>
            <div className="flex items-center gap-1 text-xs text-accent">
              <Wifi className="h-3 w-3" />
              <span>{vehicle.iot_device_id}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {commands.map((cmd) => {
                const key = `${vehicle.id}-${cmd.command}`
                return (
                  <button
                    key={cmd.command}
                    onClick={() => sendCommand(vehicle.id, cmd.command)}
                    disabled={loadingStates[key]}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors disabled:opacity-50 ${cmd.color}`}
                  >
                    <cmd.icon className="h-3.5 w-3.5" />
                    {loadingStates[key] ? "..." : cmd.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
