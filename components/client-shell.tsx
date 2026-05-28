"use client"

import dynamic from "next/dynamic"

const MobileBottomNav = dynamic(() => import("@/components/frontend/mobile-bottom-nav").then(m => ({ default: m.MobileBottomNav })), { ssr: false })
const ErrorSuppressor = dynamic(() => import("@/components/error-suppressor").then(m => ({ default: m.ErrorSuppressor })), { ssr: false })
const SettingsWrapper = dynamic(() => import("@/components/frontend/settings-wrapper").then(m => ({ default: m.SettingsWrapper })), { ssr: false })

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ErrorSuppressor />
      <SettingsWrapper>
        {children}
        <MobileBottomNav />
      </SettingsWrapper>
    </>
  )
}
