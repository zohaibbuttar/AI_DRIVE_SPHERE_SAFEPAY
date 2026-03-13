"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

type TrackedVehicle = {
  id: string
  name: string
  plate_number: string
  latitude: number
  longitude: number
}

export function TrackingMap({ vehicles }: { vehicles: TrackedVehicle[] }) {
  // Using OpenStreetMap iframe for zero-config map display
  // For production, integrate Google Maps or Mapbox API with API key
  const center = vehicles.length > 0
    ? { lat: vehicles[0].latitude, lng: vehicles[0].longitude }
    : { lat: 25.276987, lng: 55.296249 } // Default: Dubai

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Live Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-secondary">
          <iframe
            title="Vehicle Tracking Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05}%2C${center.lat - 0.05}%2C${center.lng + 0.05}%2C${center.lat + 0.05}&layer=mapnik&marker=${center.lat}%2C${center.lng}`}
          />
          {/* Vehicle markers overlay */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-md"
              >
                <MapPin className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">
                    {v.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.plate_number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Map shows approximate vehicle locations. For real-time tracking with
          Google Maps or Mapbox, add the respective API key.
        </p>
      </CardContent>
    </Card>
  )
}
