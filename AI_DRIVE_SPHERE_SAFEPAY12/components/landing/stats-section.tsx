const stats = [
  { value: "5000+", label: "Active Vehicles" },
  { value: "50K+", label: "Happy Renters" },
  { value: "$2M+", label: "Monthly Revenue" },
  { value: "99.9%", label: "Uptime" },
]

export function StatsSection() {
  return (
    <section
      id="why-us"
      className="py-24"
      style={{ background: "linear-gradient(180deg, #fdf2f0 0%, #faf8f5 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            Why Choose Drive Sphere?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            Experience the future of vehicle rentals with cutting-edge technology
            and unmatched service
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl font-bold text-accent md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
