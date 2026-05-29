"use client"

import { Crown } from "lucide-react"

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PremiumBadge({ size = "sm", className = "" }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-1 gap-1",
    lg: "text-sm px-3 py-1.5 gap-1.5",
  }

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 border border-yellow-500/30 ${sizeClasses[size]} ${className}`}
    >
      <Crown className={iconSizes[size]} />
      Premium
    </span>
  )
}

export function PremiumLockBadge({ size = "sm", className = "" }: PremiumBadgeProps) {
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500 border border-yellow-500/30 ${className}`}
      style={{ padding: size === "sm" ? "2px" : "3px" }}
    >
      <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </span>
  )
}
