"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Car, Calendar, Star, ThumbsUp } from "lucide-react"
import { BookingForm } from "./booking-form"

type Vehicle = {
  id: string
  name: string
  type: string
  plate_number: string
  status: string
  price_per_day: number
  image_url: string | null
  description: string | null
  features: string[]
  rating?: number
  total_reviews?: number
}

type FilterState = {
  category: string
  minRating: number
  sortBy: "rating" | "price_asc" | "price_desc" | "reviews"
  recommended: boolean
}

function StarRating({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : "No ratings"} ({total})
      </span>
    </div>
  )
}

function FilterBar({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const categories = ["all", "car", "suv", "van", "truck", "bike"]
  const ratingOptions = [0, 3, 3.5, 4, 4.5]

  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat === "all" ? "All Types" : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Min Rating</label>
        <div className="flex gap-1.5 flex-wrap">
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: r })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.minRating === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {r === 0 ? "Any" : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })}
          className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground"
        >
          <option value="rating">Top Rated</option>
          <option value="reviews">Most Reviewed</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Show Only</label>
        <button
          onClick={() => onChange({ ...filters, recommended: !filters.recommended })}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.recommended
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Recommended (4★+)
        </button>
      </div>
    </div>
  )
}

export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    minRating: 0,
    sortBy: "rating",
    recommended: false,
  })

  const typeLabels: Record<string, string> = {
    car: "Sedan", bike: "Bike", truck: "Truck", suv: "SUV", van: "Van",
  }

  let filtered = [...vehicles]
  if (filters.category !== "all") filtered = filtered.filter((v) => v.type === filters.category)
  if (filters.recommended) {
    filtered = filtered.filter((v) => (v.rating ?? 0) >= 4)
  } else if (filters.minRating > 0) {
    filtered = filtered.filter((v) => (v.rating ?? 0) >= filters.minRating)
  }
  filtered.sort((a, b) => {
    if (filters.sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0)
    if (filters.sortBy === "reviews") return (b.total_reviews ?? 0) - (a.total_reviews ?? 0)
    if (filters.sortBy === "price_asc") return a.price_per_day - b.price_per_day
    if (filters.sortBy === "price_desc") return b.price_per_day - a.price_per_day
    return 0
  })

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <Car className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No vehicles match your filters.</p>
          <button
            onClick={() => setFilters({ category: "all", minRating: 0, sortBy: "rating", recommended: false })}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle) => {
            const isRecommended = (vehicle.rating ?? 0) >= 4 && (vehicle.total_reviews ?? 0) >= 3
            return (
              <Card key={vehicle.id} className="overflow-hidden relative">
                {isRecommended && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                    <ThumbsUp className="h-3 w-3" />
                    RECOMMENDED
                  </div>
                )}
                <div className="relative h-48 bg-secondary flex items-center justify-center">
                  {vehicle.image_url ? (
                    <img src={vehicle.image_url} alt={vehicle.name} className="h-full w-full object-cover" />
                  ) : (
                    <Car className="h-16 w-16 text-muted-foreground/30" />
                  )}
                  <Badge className="absolute top-3 right-3" variant="secondary">
                    {typeLabels[vehicle.type] || vehicle.type}
                  </Badge>
                </div>
                <CardContent className="pt-5">
                  <h3 className="font-serif text-lg font-bold text-card-foreground">{vehicle.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {vehicle.description || "Premium rental vehicle"}
                  </p>
                  <div className="mt-2">
                    <StarRating rating={vehicle.rating ?? 0} total={vehicle.total_reviews ?? 0} />
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>${vehicle.price_per_day}/day</span>
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">{vehicle.plate_number}</span>
                  </div>
                  {vehicle.features && vehicle.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {vehicle.features.slice(0, 3).map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className="w-full" onClick={() => { setSelectedVehicle(vehicle); setBookingOpen(true) }}>
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Book {selectedVehicle?.name}</DialogTitle>
            <DialogDescription>
              ${selectedVehicle?.price_per_day}/day · Select your rental dates
              {selectedVehicle?.rating ? <span className="ml-2 text-yellow-400">★ {selectedVehicle.rating.toFixed(1)}</span> : null}
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && <BookingForm vehicle={selectedVehicle} onSuccess={() => setBookingOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
