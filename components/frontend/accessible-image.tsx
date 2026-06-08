"use client"

import NextImage, { ImageProps } from "next/image"
import React, { useState } from "react"

export function AccessibleImage(props: ImageProps) {
  // If no alt text or if it's purely decorative, don't show the wrapper label
  const hasAlt = typeof props.alt === "string" && props.alt.trim().length > 0
  const [error, setError] = useState(false)

  // Use a fallback image if error
  const finalSrc = error && !props.src ? "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80" : props.src

  const content = (
    <>
      <NextImage 
        {...props} 
        src={finalSrc}
        onError={() => setError(true)}
      />
      {hasAlt && (
        <span className="hidden [.show-alt-text_&]:block absolute bottom-0 left-0 bg-black/80 text-white text-[10px] p-1 z-50 max-w-full truncate pointer-events-none">
          {props.alt}
        </span>
      )}
    </>
  )

  if (props.fill) {
    return content
  }

  return <span className="relative inline-block w-fit">{content}</span>
}
