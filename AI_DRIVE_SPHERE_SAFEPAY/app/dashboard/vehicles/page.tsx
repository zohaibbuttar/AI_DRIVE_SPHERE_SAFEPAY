import { createClient } from "@/lib/supabase/server"
import { VehicleGrid } from "@/components/dashboard/vehicle-grid"

export default async function VehiclesPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(`*, reviews(rating)`)
    .eq("status", "available")
    .order("created_at", { ascending: false })

  const enriched = (vehicles || []).map((v: any) => {
    const reviews: { rating: number }[] = v.reviews || []
    const avg =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : v.rating ?? 0
    return {
      ...v,
      rating: parseFloat(avg.toFixed(2)),
      total_reviews: reviews.length || v.total_reviews || 0,
      reviews: undefined,
    }
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Available Vehicles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse, filter by rating, and book from our premium fleet
        </p>
      </div>
      <VehicleGrid vehicles={enriched} />
    </div>
  )
}
