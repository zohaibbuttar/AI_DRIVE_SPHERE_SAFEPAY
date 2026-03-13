import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car } from "lucide-react"
import { AdminVehicleActions } from "@/components/admin/admin-vehicle-actions"
import { AddVehicleDialog } from "@/components/admin/add-vehicle-dialog"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  rented: "secondary",
  maintenance: "destructive",
}

export default async function AdminVehiclesPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Vehicle Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, and manage your fleet
          </p>
        </div>
        <AddVehicleDialog />
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Car className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No vehicles in your fleet yet. Add your first vehicle to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {vehicles.map((vehicle: any) => (
            <Card key={vehicle.id}>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    {vehicle.image_url ? (
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <Car className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg font-bold text-card-foreground">
                        {vehicle.name}
                      </h3>
                      <Badge variant={statusColors[vehicle.status] || "outline"}>
                        {vehicle.status}
                      </Badge>
                      <Badge variant="outline">{vehicle.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.plate_number} - ${vehicle.price_per_day}/day
                    </p>
                    {vehicle.iot_device_id && (
                      <p className="text-xs text-accent">
                        IoT: {vehicle.iot_device_id}
                      </p>
                    )}
                  </div>
                </div>
                <AdminVehicleActions vehicle={vehicle} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
