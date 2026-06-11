"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

import { ErrorSuppressor } from "@/components/error-suppressor"
import { SettingsWrapper } from "@/components/frontend/settings-wrapper"

const MobileBottomNav = dynamic(() => import("@/components/frontend/mobile-bottom-nav").then(mod => mod.MobileBottomNav), { ssr: false })

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showMobileNav = pathname.startsWith("/social") || pathname.startsWith("/u/") || pathname.startsWith("/reels")

  return (
    <>
      <ErrorSuppressor />
      <SettingsWrapper>
        <div className={`flex flex-col min-h-screen ${showMobileNav ? "pb-16" : ""}`}>
          {children}
        </div>
        <MobileBottomNav />
      </SettingsWrapper>
    </>
  )
}
