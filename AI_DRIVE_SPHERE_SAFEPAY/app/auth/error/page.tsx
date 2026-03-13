import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-foreground/40" aria-hidden="true" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-card p-10 shadow-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-card-foreground">
          Authentication Error
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Something went wrong during authentication. Please try again or
          contact support if the issue persists.
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
