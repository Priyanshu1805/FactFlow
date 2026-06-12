"use client"

import { useState } from "react"
import { ImageProps } from "next/image"
import { AccessibleImage as Image } from "@/components/frontend/accessible-image"
import { useSettingsStore } from "@/store/settings-store"

interface SafeImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string | null | undefined
  alt: string
  fallbackSrc?: string
  priority?: boolean
}

export function SafeImage({ src, alt, fallbackSrc = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80", priority, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const { settings } = useSettingsStore()
  
  const blurGraphic = settings?.privacy?.blurGraphicImagery ?? false
  const isBlurred = blurGraphic && !revealed

  const handleClick = (e: React.MouseEvent) => {
    if (isBlurred) {
      e.preventDefault()
      e.stopPropagation()
      setRevealed(true)
    }
  }

  const finalSrc = error || !src ? fallbackSrc : src
  const isHttp = finalSrc.startsWith("http://") || finalSrc.startsWith("https://")

  let imgElement: React.ReactNode

  if (isHttp) {
    const { fill, ...rest } = props as any
    imgElement = (
      <img
        src={finalSrc}
        alt={alt}
        onError={() => setError(true)}
        className={`${props.className || ""} ${isBlurred ? "blur-xl transition-all duration-300 cursor-pointer" : "transition-all duration-300"}`}
        style={fill ? { position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent", objectFit: "cover" } : {}}
        loading={priority ? "eager" : "lazy"}
        {...rest}
      />
    )
  } else {
    imgElement = (
      <Image
        src={finalSrc}
        alt={alt}
        onError={() => setError(true)}
        className={`${props.className || ""} ${isBlurred ? "blur-xl transition-all duration-300 cursor-pointer" : "transition-all duration-300"}`}
        priority={priority}
        {...props}
      />
    )
  }

  if (isBlurred) {
    return (
      <div className="relative w-full h-full min-h-[inherit] overflow-hidden group" onClick={handleClick}>
        {imgElement}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center transition-all group-hover:bg-black/60 cursor-pointer z-10">
          <span className="text-white text-[10px] font-black uppercase tracking-widest bg-red-600/90 px-2 py-0.5 rounded shadow border border-red-500/20">
            Graphic Content
          </span>
          <span className="text-white/80 text-[9px] mt-1 font-semibold bg-black/60 px-1.5 py-0.5 rounded-full">
            Click to reveal
          </span>
        </div>
      </div>
    )
  }

  return imgElement
}
