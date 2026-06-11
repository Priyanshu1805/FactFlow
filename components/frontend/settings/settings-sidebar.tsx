"use client"

import {
  User, Bell, Palette, Globe, Shield, CreditCard,
  Rss, Eye, Volume2, Accessibility, ChevronRight, LogOut, Lock
} from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n/languageStore"

const FeedLangIcon = (props: any) => {
  return (
    <div className={`relative flex items-center justify-center ${props.className}`}>
      <Rss className="w-5 h-5" />
      <Globe className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-[#1a1a1a] rounded-full" />
    </div>
  )
}

export const SETTINGS_SECTIONS = [
  { id: "profile",       tKey: "sidebarProfile",       tDescKey: "sidebarProfileDesc",       icon: User },
  { id: "account",       tKey: "sidebarAccount",       tDescKey: "sidebarAccountDesc",       icon: Lock },
  { id: "subscription",  tKey: "sidebarSubscription",  tDescKey: "sidebarSubscriptionDesc",  icon: CreditCard },
  { id: "appearance",    tKey: "sidebarAppearance",    tDescKey: "sidebarAppearanceDesc",    icon: Palette },
  { id: "notifications", tKey: "sidebarNotifications", tDescKey: "sidebarNotificationsDesc", icon: Bell },
  { id: "feed",          tKey: "sidebarFeed",          tDescKey: "sidebarFeedDesc",          icon: FeedLangIcon },
  { id: "privacy",       tKey: "sidebarPrivacy",       tDescKey: "sidebarPrivacyDesc",       icon: Shield },
  { id: "accessibility", tKey: "sidebarAccessibility", tDescKey: "sidebarAccessibilityDesc", icon: Accessibility },
  { id: "content",       tKey: "sidebarContent",       tDescKey: "sidebarContentDesc",       icon: Eye },
  { id: "audio",         tKey: "sidebarAudio",         tDescKey: "sidebarAudioDesc",         icon: Volume2 },
]

interface SettingsSidebarProps {
  active: string
  onChange: (id: string) => void
}

export function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      logout();
      window.location.href = "/";
    } catch (e) {
      toast.error("Error signing out");
    }
  }

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
      {/* User Summary Block */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-red-500 shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 dark:text-white font-bold text-sm truncate">{user?.displayName || "Fact Flow User"}</h3>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs truncate">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("signOut")}
        </button>
      </div>

      <nav>
        <ul className="space-y-1">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = active === section.id
          return (
            <li key={section.id}>
              <button
                onClick={() => onChange(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-gray-900 dark:text-white font-medium"
                    : "text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-red-500" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive ? "text-gray-900 dark:text-white" : ""}`}>{t(section.tKey)}</p>
                  <p className="text-xs text-gray-500 dark:text-white/[0.85] truncate">{t(section.tDescKey)}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-red-500 shrink-0" />}
              </button>
            </li>
          )
        })}
      </ul>
      </nav>
    </div>
  )
}
