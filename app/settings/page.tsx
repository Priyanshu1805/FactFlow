"use client"

import { useState, useEffect, Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SettingsSidebar } from "@/components/frontend/settings/settings-sidebar"
import { ProfileSettings } from "@/components/frontend/settings/profile-settings"
import { AccountSettings } from "@/components/frontend/settings/account-settings"
import { SubscriptionSettings } from "@/components/frontend/settings/subscription-settings"
import { AppearanceSettings } from "@/components/frontend/settings/appearance-settings"
import { NotificationSettings } from "@/components/frontend/settings/notification-settings"
import { FeedSettings } from "@/components/frontend/settings/feed-settings"
import { PrivacySettings } from "@/components/frontend/settings/privacy-settings"
import {
  LanguageSettings,
  ContentSettings,
  AccessibilitySettings,
  AudioSettings,
} from "@/components/frontend/settings/other-settings"

const PANELS: Record<string, React.ComponentType> = {
  profile:       ProfileSettings,
  account:       AccountSettings,
  subscription:  SubscriptionSettings,
  appearance:    AppearanceSettings,
  notifications: NotificationSettings,
  feed:          FeedSettings,
  language:      LanguageSettings,
  privacy:       PrivacySettings,
  accessibility: AccessibilitySettings,
  content:       ContentSettings,
  audio:         AudioSettings,
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"
  
  const [active, setActive] = useState(defaultTab)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Update active tab if query param changes
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && PANELS[tab]) {
      setActive(tab)
    }
  }, [searchParams])

  const ActivePanel = PANELS[active] ?? ProfileSettings

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-gray-300 dark:text-white/20">|</span>
          <h1 className="text-gray-900 dark:text-white font-bold text-sm">Settings</h1>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden ml-auto text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:hover:text-white text-xs border border-gray-300 dark:border-white/15 px-3 py-1.5 rounded-lg transition-colors"
          >
            {mobileOpen ? "Close Menu" : "Change Section ▾"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className={`lg:block shrink-0 ${mobileOpen ? "block w-full" : "hidden lg:block"}`}>
            <SettingsSidebar
              active={active}
              onChange={(id) => {
                setActive(id)
                setMobileOpen(false)
              }}
            />
          </div>
          {!mobileOpen && (
            <div className="flex-1 min-w-0">
              <ActivePanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300" />}>
      <SettingsContent />
    </Suspense>
  )
}
