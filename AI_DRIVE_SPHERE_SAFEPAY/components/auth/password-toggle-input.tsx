"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordToggleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function PasswordToggleInput({
  label,
  className,
  ...props
}: PasswordToggleInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-semibold text-card-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={`w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${className || ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 w-4" strokeWidth={2.5} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  )
}
