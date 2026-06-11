"use client"

import { Suspense } from "react"
import { Navbar } from "@/components/frontend/navbar"
import { Footer } from "@/components/frontend/footer"

function NavbarPlaceholder() {
  return <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-xl border-b border-white/10" />
}

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={<NavbarPlaceholder />}>
        <Navbar />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
