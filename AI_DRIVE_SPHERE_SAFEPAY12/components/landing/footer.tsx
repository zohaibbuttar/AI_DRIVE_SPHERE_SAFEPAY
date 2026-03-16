import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-serif font-bold text-sm">
                DS
              </span>
            </div>
            <span className="font-serif text-xl font-bold text-primary-foreground">
              Drive Sphere
            </span>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/auth/login"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="#features"
              className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              Features
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-xs text-primary-foreground/50">
            {"Drive Sphere. All rights reserved. Premium vehicle rental management."}
          </p>
        </div>
      </div>
    </footer>
  )
}
