"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const MobileBottomNav = dynamic(() => import("@/components/frontend/mobile-bottom-nav").then(m => ({ default: m.MobileBottomNav })), { ssr: false })
const ErrorSuppressor = dynamic(() => import("@/components/error-suppressor").then(m => ({ default: m.ErrorSuppressor })), { ssr: false })
const SettingsWrapper = dynamic(() => import("@/components/frontend/settings-wrapper").then(m => ({ default: m.SettingsWrapper })), { ssr: false })

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
