import Link from "next/link"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-foreground/40" aria-hidden="true" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-card p-10 shadow-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-card-foreground">
          Check Your Email
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We have sent a confirmation link to your email address. Please click
          the link to verify your account and start using Drive Sphere.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
