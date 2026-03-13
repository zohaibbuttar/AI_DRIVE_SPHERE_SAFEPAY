"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, Trash2, CheckCircle, Wrench } from "lucide-react"

type Vehicle = {
  id: string
  name: string
  status: string
}

export function AdminVehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("vehicles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", vehicle.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Vehicle marked as ${status}`)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${vehicle.name}"? This cannot be undone.`)) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Vehicle deleted")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {vehicle.status !== "available" && (
          <DropdownMenuItem onClick={() => updateStatus("available")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Available
          </DropdownMenuItem>
        )}
        {vehicle.status !== "maintenance" && (
          <DropdownMenuItem onClick={() => updateStatus("maintenance")}>
            <Wrench className="mr-2 h-4 w-4" />
            Mark Maintenance
          </DropdownMenuItem>
        )}
        {vehicle.status !== "rented" && (
          <DropdownMenuItem onClick={() => updateStatus("rented")}>
            <Pencil className="mr-2 h-4 w-4" />
            Mark Rented
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Vehicle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
