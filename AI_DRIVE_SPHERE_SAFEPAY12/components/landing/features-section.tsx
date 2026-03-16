import { ShieldCheck, Zap, LayoutDashboard, MapPin, BarChart3, Lock } from "lucide-react"

const darkFeatures = [
  {
    icon: ShieldCheck,
    title: "Uncompromising Security",
    description:
      "Every vehicle undergoes a rigorous 150-point inspection before it joins our elite fleet.",
  },
  {
    icon: Zap,
    title: "Instant Precision",
    description:
      "Experience the power of real-time IoT integration. Remote locking and tracking at your fingertips.",
  },
  {
    icon: LayoutDashboard,
    title: "Intuitive Control",
    description:
      "A dashboard designed for clarity. Manage your bookings or your business with absolute ease.",
  },
]

const lightFeatures = [
  {
    icon: Lock,
    title: "Secure & Trusted",
    description:
      "Verified users, secure payments, and comprehensive insurance coverage for every rental.",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description:
      "Live GPS tracking, instant notifications, and complete booking history at your fingertips.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Detailed reports, revenue tracking, and insights to optimize your rental business.",
  },
]

export function FeaturesSection() {
  return (
    <>
      {/* Dark features section */}
      <section id="features" className="bg-primary py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            {darkFeatures.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-4">
                <feature.icon className="h-10 w-10 text-accent" strokeWidth={1.5} />
                <h3 className="font-serif text-xl font-bold text-primary-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-primary-foreground/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light features section */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {lightFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-md"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <feature.icon
                    className="h-6 w-6 text-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-serif text-lg font-bold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
