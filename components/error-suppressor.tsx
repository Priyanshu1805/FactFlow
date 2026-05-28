"use client"
import { useEffect } from "react"

// Suppress harmless DOMExceptions related to media play() aborts
// which commonly occur when iframes or videos unmount quickly in React.
export function ErrorSuppressor() {
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      if (
        e.reason?.name === "AbortError" || 
        e.reason?.message?.includes("The play() request was interrupted")
      ) {
        e.preventDefault() // Prevents Next.js Red Error Overlay
      }
    }
    window.addEventListener("unhandledrejection", handler)
    return () => window.removeEventListener("unhandledrejection", handler)
  }, [])

  return null
}
