"use client"

import dynamic from "next/dynamic"

const CommandPalette = dynamic(() => import("@/components/frontend/command-palette").then(m => ({ default: m.CommandPalette })), { ssr: false })
const FuturisticSearch = dynamic(() => import("@/components/frontend/futuristic-search").then(m => ({ default: m.FuturisticSearch })), { ssr: false })

export function DynamicClients() {
  return (
    <>
      <CommandPalette />
      <FuturisticSearch />
    </>
  )
}
