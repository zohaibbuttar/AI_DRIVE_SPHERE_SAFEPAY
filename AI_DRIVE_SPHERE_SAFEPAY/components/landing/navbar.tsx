"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-sm">
              DS
            </span>
          </div>
          <span className="font-serif text-xl font-bold text-foreground">
            Drive Sphere
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#why-us"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Why Us
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
          <Link
            href="#features"
            className="text-sm text-muted-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#why-us"
            className="text-sm text-muted-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Why Us
          </Link>
          <Link href="/auth/login" className="text-sm text-muted-foreground">
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}
