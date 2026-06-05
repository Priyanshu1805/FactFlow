"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { 
  Bell, Flame, Mail, MessageCircle, AtSign, Calendar, Lock, 
  Check, Radio, Bookmark, Moon, Clock, Settings
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function Toggle({ 
  on, 
  onChange, 
  disabled = false 
}: { 
  on: boolean; 
  onChange: (v: boolean) => void; 
  disabled?: boolean 
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        disabled ? "bg-white/5 opacity-50 cursor-not-allowed" : on ? "bg-[#e84118]" : "bg-white/15"
      }`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        on ? "translate-x-5" : "translate-x-0.5"
      }`} />
    </button>
  )
}

function SaveIndicator({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="ml-3"
        >
          <Check className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function NotificationSettings() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<"Free" | "Pro" | "Premium">("Free")
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({})
  const [pushBlocked, setPushBlocked] = useState(false)
  
  const [prefs, setPrefs] = useState({
    pushEnabled: false,
    breakingNews: false,
    liveUpdates: false,
    commentReplies: true,
    mentions: true,
    savedArticleUpdates: false,
    dailyDigest: { enabled: true, time: "7AM" as "7AM" | "12PM" | "6PM" | "9PM" },
    weeklySummary: false,
    quietHours: { enabled: false, from: "22:00", to: "07:00" },
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!user?.uid) {
      if (isAuthenticated === false) setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) return

        const [subRes, prefsRes] = await Promise.all([
          fetch(`${API}/subscription/me?firebaseUid=${user.uid}`),
          fetch(`${API}/notifications/prefs?firebaseUid=${user.uid}`)
        ])

        if (subRes.ok) {
          const subData = await subRes.json()
          if (subData.success && subData.data) {
            setPlan(subData.data.plan || "Free")
          }
        }

        if (prefsRes.ok) {
          const prefsData = await prefsRes.json()
          if (prefsData.success && prefsData.data) {
            setPrefs({
              pushEnabled: prefsData.data.pushEnabled || false,
              breakingNews: prefsData.data.breakingNews || false,
              liveUpdates: prefsData.data.liveUpdates || false,
              commentReplies: prefsData.data.commentReplies !== false,
              mentions: prefsData.data.mentions !== false,
              savedArticleUpdates: prefsData.data.savedArticleUpdates || false,
              dailyDigest: prefsData.data.dailyDigest || { enabled: true, time: "7AM" },
              weeklySummary: prefsData.data.weeklySummary || false,
              quietHours: prefsData.data.quietHours || { enabled: false, from: "22:00", to: "07:00" },
            })
          }
        }
      } catch (err) {
        console.error("Failed to load notification settings", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isAuthenticated])

  const showSaveSuccess = (key: string) => {
    setSavedKeys(prev => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setSavedKeys(prev => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const saveSettings = async (newPrefs: typeof prefs, keyToAnimate: string) => {
    if (!user?.uid) return
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) return

      const res = await fetch(`${API}/notifications/prefs?firebaseUid=${user.uid}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newPrefs)
      })
      if (res.ok) {
        showSaveSuccess(keyToAnimate)
      }
    } catch {
      toast.error("Failed to save settings")
    }
  }

  const toggle = (key: keyof typeof prefs, subKey?: string) => {
    let newPrefs = { ...prefs }
    
    if (subKey && typeof (prefs as any)[key] === 'object') {
      newPrefs = {
        ...prefs,
        [key]: {
          ...(prefs as any)[key],
          [subKey]: !(prefs as any)[key][subKey]
        }
      }
    } else {
      newPrefs = { ...prefs, [key]: !(prefs as any)[key] }
    }
    
    setPrefs(newPrefs)
    saveSettings(newPrefs, subKey ? `${key}_${subKey}` : key)
  }

  const updateNestedValue = (key: keyof typeof prefs, subKey: string, value: any) => {
    const newPrefs = {
      ...prefs,
      [key]: {
        ...(prefs as any)[key],
        [subKey]: value
      }
    }
    setPrefs(newPrefs)
    saveSettings(newPrefs, `${key}_${subKey}`)
  }

  const handlePushToggle = async (enabled: boolean) => {
    setPushBlocked(false)
    if (enabled) {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        toast.error("This browser does not support push notifications")
        return
      }
      try {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          const registration = await navigator.serviceWorker.register("/sw.js")
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (!vapidKey) {
            toast.error("Push configuration missing")
            return
          }
          
          let pushSubscription = await registration.pushManager.getSubscription()
          
          if (pushSubscription) {
            // Unsubscribe the old one just in case it has the old VAPID key
            await pushSubscription.unsubscribe()
          }
          
          pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
          })

          const newPrefs = { ...prefs, pushEnabled: true, pushSubscription }
          setPrefs(newPrefs)
          saveSettings(newPrefs, "pushEnabled")
          
          await fetch(`${API}/notifications/prefs/push-subscribe?firebaseUid=${user?.uid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: pushSubscription })
          }).catch(console.error)
          
        } else {
          toast.error("You must allow notifications in your browser settings");
          setPushBlocked(true)
        }
      } catch (err) {
        console.error("Push registration error", err)
        toast.error("Push registration failed");
        setPushBlocked(true)
      }
    } else {
      const newPrefs = { ...prefs, pushEnabled: false }
      setPrefs(newPrefs)
      saveSettings(newPrefs, "pushEnabled")
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 max-w-2xl">
        <div className="h-8 w-48 bg-white/10 animate-pulse rounded" />
        {[1, 2, 3, 4, 5].map(section => (
          <div key={section} className="space-y-4">
            <div className="h-6 w-32 bg-white/10 animate-pulse rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const isFree = plan === "Free"

  return (
    <div className="space-y-10 text-white max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Notifications</h2>
          <p className="text-white/60 text-sm">Control what alerts you receive and how</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 flex items-center gap-2">
          <span className="text-xs text-white/60">Current Plan</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            isFree ? "bg-gray-600" : "bg-gradient-to-r from-orange-500 to-amber-500 text-black"
          }`}>
            {plan}
          </span>
        </div>
      </div>

      {/* SECTION 1 — Push Notifications */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Push Notifications</h3>
        
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-green-500/10 h-fit">
              <Bell className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">Enable Push Notifications</p>
              <p className="text-white/50 text-xs mt-1 max-w-md">Receive direct alerts in your browser even when FactFlow is closed.</p>
              {pushBlocked && (
                <p className="text-red-400 text-xs mt-2 font-medium">
                  Browser blocked notifications. Please click the lock icon 🔒 next to the URL bar to allow them, then try again.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["pushEnabled"]} />
            <div className="ml-3">
              <Toggle on={prefs.pushEnabled} onChange={handlePushToggle} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Breaking & Live News */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Breaking & Live News</h3>
        
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-red-500/10 h-fit">
              <Flame className="w-5 h-5 text-[#e84118]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-medium text-sm ${isFree ? "text-white/50" : "text-white"}`}>Breaking News Alerts</p>
                {isFree && <Lock className="w-3 h-3 text-white/40" />}
                {isFree && <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-1.5 py-0.5 rounded">Pro</span>}
              </div>
              <p className="text-white/50 text-xs mt-1 max-w-md">Get notified instantly for major breaking stories</p>
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["breakingNews"]} />
            <div className="ml-3">
              {isFree ? (
                <Link href="/pricing" className="text-xs font-bold text-[#e84118] bg-[#e84118]/10 hover:bg-[#e84118]/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  Upgrade
                </Link>
              ) : (
                <Toggle on={prefs.breakingNews} onChange={() => toggle("breakingNews")} />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-orange-500/10 h-fit">
              <Radio className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-medium text-sm ${isFree ? "text-white/50" : "text-white"}`}>Live News Updates</p>
                {isFree && <Lock className="w-3 h-3 text-white/40" />}
                {isFree && <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-1.5 py-0.5 rounded">Pro</span>}
              </div>
              <p className="text-white/50 text-xs mt-1 max-w-md">When a live news event starts</p>
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["liveUpdates"]} />
            <div className="ml-3">
              {isFree ? (
                <Link href="/pricing" className="text-xs font-bold text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  Upgrade
                </Link>
              ) : (
                <Toggle on={prefs.liveUpdates} onChange={() => toggle("liveUpdates")} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — My Activity */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">My Activity</h3>
        
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-purple-500/10 h-fit">
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">Comment Replies</p>
              <p className="text-white/50 text-xs mt-1 max-w-md">When someone replies to your comment</p>
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["commentReplies"]} />
            <div className="ml-3">
              <Toggle on={prefs.commentReplies} onChange={() => toggle("commentReplies")} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-yellow-500/10 h-fit">
              <AtSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">Mentions</p>
              <p className="text-white/50 text-xs mt-1 max-w-md">When someone @mentions you in comments</p>
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["mentions"]} />
            <div className="ml-3">
              <Toggle on={prefs.mentions} onChange={() => toggle("mentions")} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-blue-500/10 h-fit">
              <Bookmark className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">Saved Article Updates</p>
              <p className="text-white/50 text-xs mt-1 max-w-md">When a saved article gets a major update</p>
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["savedArticleUpdates"]} />
            <div className="ml-3">
              <Toggle on={prefs.savedArticleUpdates} onChange={() => toggle("savedArticleUpdates")} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Email Digest */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Email Digest</h3>
        
        <div className="flex flex-col p-4 rounded-xl border border-white/10 bg-white/[0.02] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10 h-fit">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Daily Digest Email</p>
                <p className="text-white/50 text-xs mt-1 max-w-md">Top stories delivered to your inbox</p>
              </div>
            </div>
            <div className="flex items-center">
              <SaveIndicator show={!!savedKeys["dailyDigest_enabled"]} />
              <div className="ml-3">
                <Toggle on={prefs.dailyDigest.enabled} onChange={() => toggle("dailyDigest", "enabled")} />
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {prefs.dailyDigest.enabled && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden border-t border-white/5 pt-4 pl-14"
              >
                <p className="text-xs text-white/40 mb-3">Delivery Time</p>
                <div className="flex flex-wrap gap-2">
                  {["7AM", "12PM", "6PM", "9PM"].map((time) => (
                    <button
                      key={time}
                      onClick={() => updateNestedValue("dailyDigest", "time", time)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        prefs.dailyDigest.time === time 
                          ? "bg-[#e84118] text-white shadow-lg shadow-[#e84118]/20" 
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {time.replace(/([A-Z]+)/, " $1")}
                    </button>
                  ))}
                  <div className="flex items-center">
                     <SaveIndicator show={!!savedKeys["dailyDigest_time"]} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 h-fit">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-medium text-sm ${isFree ? "text-white/50" : "text-white"}`}>Weekly Summary</p>
                {isFree && <Lock className="w-3 h-3 text-white/40" />}
                {isFree && <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold px-1.5 py-0.5 rounded">Premium</span>}
              </div>
              <p className="text-white/50 text-xs mt-1 max-w-md">Best of the week every Sunday</p>
            </div>
          </div>
          <div className="flex items-center">
            <SaveIndicator show={!!savedKeys["weeklySummary"]} />
            <div className="ml-3">
              {isFree ? (
                <Link href="/pricing" className="text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  Upgrade
                </Link>
              ) : (
                <Toggle on={prefs.weeklySummary} onChange={() => toggle("weeklySummary")} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Quiet Hours */}
      <section className="space-y-3 pb-10">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Quiet Hours</h3>
        
        <div className="flex flex-col p-4 rounded-xl border border-white/10 bg-white/[0.02] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 h-fit">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Enable Quiet Hours</p>
                <p className="text-white/50 text-xs mt-1 max-w-md">Pause all notifications during set hours</p>
              </div>
            </div>
            <div className="flex items-center">
              <SaveIndicator show={!!savedKeys["quietHours_enabled"]} />
              <div className="ml-3">
                <Toggle on={prefs.quietHours.enabled} onChange={() => toggle("quietHours", "enabled")} />
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {prefs.quietHours.enabled && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden border-t border-white/5 pt-4 pl-14 flex items-center gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/40">From</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                      type="time" 
                      value={prefs.quietHours.from}
                      onChange={(e) => updateNestedValue("quietHours", "from", e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#e84118] transition-colors" 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/40">To</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                      type="time" 
                      value={prefs.quietHours.to}
                      onChange={(e) => updateNestedValue("quietHours", "to", e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#e84118] transition-colors" 
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center">
                  <SaveIndicator show={!!savedKeys["quietHours_from"] || !!savedKeys["quietHours_to"]} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
