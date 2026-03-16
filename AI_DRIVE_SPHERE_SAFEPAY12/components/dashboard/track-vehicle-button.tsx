"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Navigation, Wifi, WifiOff } from "lucide-react"

type Location = { latitude: number; longitude: number; recorded_at?: string }

export function TrackVehicleButton({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  async function fetchLocation() {
    const { data } = await supabase
      .from("vehicles")
      .select("latitude, longitude, updated_at")
      .eq("id", vehicleId)
      .single()
    if (data?.latitude && data?.longitude) {
      setLocation({ latitude: data.latitude, longitude: data.longitude, recorded_at: data.updated_at })
    }
  }

  async function handleOpen() {
    setOpen(true); setLoading(true)
    await fetchLocation()
    setLoading(false)
  }

  function startLive() { setLive(true); intervalRef.current = setInterval(fetchLocation, 5000) }
  function stopLive() { setLive(false); if (intervalRef.current) clearInterval(intervalRef.current) }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const mapSrc = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01}%2C${location.latitude - 0.01}%2C${location.longitude + 0.01}%2C${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`
    : null

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="flex items-center gap-2">
        <Navigation className="h-4 w-4 text-primary" />
        Track Vehicle
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); stopLive() }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Tracking: {vehicleName}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Loading location...</div>
          ) : location ? (
            <div className="flex flex-col gap-4">
              <div className="h-64 rounded-lg overflow-hidden border border-border">
                <iframe title="Vehicle Location" width="100%" height="100%" style={{ border: 0 }} src={mapSrc!} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="text-sm font-mono font-semibold">{location.latitude.toFixed(6)}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="text-sm font-mono font-semibold">{location.longitude.toFixed(6)}</p>
                </div>
              </div>
              {location.recorded_at && (
                <p className="text-xs text-muted-foreground">Last updated: {new Date(location.recorded_at).toLocaleTimeString()}</p>
              )}
              <div className="flex items-center gap-3">
                <Button size="sm" variant={live ? "destructive" : "default"} onClick={live ? stopLive : startLive} className="flex items-center gap-2">
                  {live ? <><WifiOff className="h-4 w-4" /> Stop Live</> : <><Wifi className="h-4 w-4" /> Start Live Tracking</>}
                </Button>
                {live && (
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Updating every 5s
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <Navigation className="h-8 w-8 opacity-30" />
              <p className="text-sm">No GPS data available for this vehicle yet.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
