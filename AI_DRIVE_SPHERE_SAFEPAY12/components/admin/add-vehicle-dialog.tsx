"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function AddVehicleDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    type: "car",
    plate_number: "",
    price_per_day: "",
    description: "",
    image_url: "",
    features: "",
    gps_device_id: "",
    iot_device_id: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("vehicles").insert({
      name: form.name,
      type: form.type,
      plate_number: form.plate_number,
      price_per_day: parseFloat(form.price_per_day),
      description: form.description || null,
      image_url: form.image_url || null,
      features: form.features
        ? form.features.split(",").map((f) => f.trim())
        : [],
      gps_device_id: form.gps_device_id || null,
      iot_device_id: form.iot_device_id || null,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Vehicle added!")
      setOpen(false)
      setForm({
        name: "",
        type: "car",
        plate_number: "",
        price_per_day: "",
        description: "",
        image_url: "",
        features: "",
        gps_device_id: "",
        iot_device_id: "",
      })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Add New Vehicle</DialogTitle>
          <DialogDescription>Add a vehicle to your fleet</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                placeholder="Tesla Model 3"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Type</label>
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="car">Car</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Plate Number
              </label>
              <input
                type="text"
                value={form.plate_number}
                onChange={(e) => updateField("plate_number", e.target.value)}
                required
                placeholder="ABC-1234"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Price/Day ($)
              </label>
              <input
                type="number"
                value={form.price_per_day}
                onChange={(e) => updateField("price_per_day", e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="99.99"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Vehicle description..."
              rows={2}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Image URL</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => updateField("image_url", e.target.value)}
              placeholder="https://..."
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={form.features}
              onChange={(e) => updateField("features", e.target.value)}
              placeholder="GPS, Bluetooth, Sunroof"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                GPS Device ID
              </label>
              <input
                type="text"
                value={form.gps_device_id}
                onChange={(e) => updateField("gps_device_id", e.target.value)}
                placeholder="GPS-001"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                IoT Device ID
              </label>
              <input
                type="text"
                value={form.iot_device_id}
                onChange={(e) => updateField("iot_device_id", e.target.value)}
                placeholder="IOT-001"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Adding..." : "Add Vehicle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
