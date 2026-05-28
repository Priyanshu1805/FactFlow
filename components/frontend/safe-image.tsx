"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"

interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined
  alt: string
  fallbackSrc?: string
}

export function SafeImage({ src, alt, fallbackSrc = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80", ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  const finalSrc = error || !src ? fallbackSrc : src

  const isHttp = finalSrc.startsWith("http://")

  if (isHttp) {
    // Fallback to standard <img> for http:// URLs to bypass Next.js config requirements instantly
    const { fill, ...rest } = props as any
    return (
      <img
        src={finalSrc}
        alt={alt}
        onError={() => setError(true)}
        className={props.className}
        style={fill ? { position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent", objectFit: "cover" } : {}}
        {...rest}
      />
    )
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}
