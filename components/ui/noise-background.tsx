"use client"

import React from "react"

interface NoiseBackgroundProps {
  children: React.ReactNode
  containerClassName?: string
  gradientColors?: string[]
}

export function NoiseBackground({
  children,
  containerClassName = "",
  gradientColors = ["rgb(255, 100, 150)", "rgb(100, 150, 255)", "rgb(255, 200, 100)"],
}: NoiseBackgroundProps) {
  const gradientStyle = gradientColors.length > 1
    ? `linear-gradient(135deg, ${gradientColors.join(", ")})`
    : gradientColors[0] || "linear-gradient(135deg, rgb(255, 100, 150), rgb(100, 150, 255), rgb(255, 200, 100))"

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <div
        className="absolute inset-0"
        style={{ background: gradientStyle }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.35,
          mixBlendMode: "overlay",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
