import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi } from "lucide-react"
import { IoTControlPanel } from "@/components/admin/iot-control-panel"

export default async function IoTPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, name, plate_number, status, iot_device_id")
    .not("iot_device_id", "is", null)
    .order("name")

  const { data: recentCommands } = await supabase
    .from("iot_commands")
    .select("*, vehicles(name)")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          IoT Control Panel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Remote lock, unlock, and immobilize vehicles via MQTT
        </p>
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wifi className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No vehicles with IoT devices. Add IoT device IDs to vehicles to
              control them remotely.
            </p>
          </CardContent>
        </Card>
      ) : (
        <IoTControlPanel vehicles={vehicles} />
      )}

      {/* Command history */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Recent IoT Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recentCommands || recentCommands.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No commands sent yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentCommands.map((cmd: any) => (
                <div
                  key={cmd.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-card-foreground">
                      {cmd.vehicles?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cmd.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="uppercase">
                      {cmd.command}
                    </Badge>
                    <Badge
                      variant={
                        cmd.status === "acknowledged"
                          ? "default"
                          : cmd.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {cmd.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
