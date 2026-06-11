"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const CommandPalette = dynamic(() => import("@/components/frontend/command-palette").then(mod => mod.CommandPalette), { ssr: false })
const FuturisticSearch = dynamic(() => import("@/components/frontend/futuristic-search").then(mod => mod.FuturisticSearch), { ssr: false })

export function DynamicClients() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <CommandPalette />
      <FuturisticSearch />
    </>
  )
}
