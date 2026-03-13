"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Wifi, WifiOff, RefreshCw } from "lucide-react"

type TrackedVehicle = {
  id: string
  name: string
  plate_number: string
  status: string
  latitude: number
  longitude: number
  updated_at: string
}

export default function AdminTrackingPage() {
  const [vehicles, setVehicles] = useState<TrackedVehicle[]>([])
  const [selected, setSelected] = useState<TrackedVehicle | null>(null)
  const [live, setLive] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const supabase = createClient()

  const fetchVehicles = useCallback(async () => {
    const { data } = await supabase
      .from("vehicles")
      .select("id, name, plate_number, status, latitude, longitude, updated_at")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
    if (data) { setVehicles(data as TrackedVehicle[]); setLastRefresh(new Date()) }
  }, [supabase])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  useEffect(() => {
    if (!live) return
    const interval = setInterval(fetchVehicles, 5000)
    return () => clearInterval(interval)
  }, [live, fetchVehicles])

  useEffect(() => {
    const channel = supabase
      .channel("vehicle-locations")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "vehicles" }, (payload) => {
        const updated = payload.new as TrackedVehicle
        if (updated.latitude && updated.longitude) {
          setVehicles((prev) => prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)))
          setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const mapVehicle = selected || vehicles[0]
  const mapSrc = mapVehicle
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapVehicle.longitude - 0.02}%2C${mapVehicle.latitude - 0.02}%2C${mapVehicle.longitude + 0.02}%2C${mapVehicle.latitude + 0.02}&layer=mapnik&marker=${mapVehicle.latitude}%2C${mapVehicle.longitude}`
    : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Fleet GPS Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live location monitoring for all GPS-equipped vehicles
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastRefresh && <span className="text-xs text-muted-foreground">Updated: {lastRefresh.toLocaleTimeString()}</span>}
          <Button size="sm" variant="outline" onClick={fetchVehicles} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" variant={live ? "destructive" : "default"} onClick={() => setLive(!live)} className="flex items-center gap-2">
            {live ? <><WifiOff className="h-4 w-4" /> Stop Live</> : <><Wifi className="h-4 w-4" /> Go Live</>}
          </Button>
          {live && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Live
            </span>
          )}
        </div>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No vehicles with GPS data yet. Connect GPS devices via the IoT endpoint.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-1">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${selected?.id === vehicle.id ? "border-primary" : ""}`}
                onClick={() => setSelected(vehicle)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-card-foreground">{vehicle.name}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.plate_number}</p>
                    </div>
                    <Badge variant={vehicle.status === "available" ? "default" : vehicle.status === "rented" ? "secondary" : "destructive"} className="text-xs">
                      {vehicle.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Navigation className="h-3 w-3" />
                    {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
                  </div>
                  {vehicle.updated_at && (
                    <p className="mt-1 text-[10px] text-muted-foreground/60">{new Date(vehicle.updated_at).toLocaleTimeString()}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {mapVehicle?.name || "Select a vehicle"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mapSrc ? (
                  <>
                    <div className="h-96 rounded-lg overflow-hidden border border-border">
                      <iframe key={mapSrc} title="GPS Tracking Map" width="100%" height="100%" style={{ border: 0 }} src={mapSrc} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Latitude</p>
                        <p className="text-sm font-mono font-semibold">{mapVehicle.latitude.toFixed(6)}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-muted-foreground">Longitude</p>
                        <p className="text-sm font-mono font-semibold">{mapVehicle.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      💡 Connect your GPS tracker to POST to{" "}
                      <code className="bg-secondary px-1 rounded">/api/tracking</code>{" "}
                      with <code className="bg-secondary px-1 rounded">{"{ vehicle_id, latitude, longitude }"}</code>
                    </p>
                  </>
                ) : (
                  <div className="flex h-96 items-center justify-center text-muted-foreground text-sm">
                    Select a vehicle to view on map
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
