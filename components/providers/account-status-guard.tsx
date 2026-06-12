"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { AlertTriangle, Loader2, RefreshCw, LogOut } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AccountStatusGuard({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<"active" | "disabled" | "scheduled">("active")
  
  console.log("[AccountStatusGuard] checking:", checking, "status:", status)
  
  const [deletionDate, setDeletionDate] = useState<string>("")
  const [reactivating, setReactivating] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      if (!user?.uid) {
        setChecking(false)
        return
      }

      try {
        const res = await fetch(`${API}/users/profile?firebaseUid=${user.uid}`)
        const data = await res.json()
        
        if (data.success && data.user) {
          if (data.user.isDisabled) {
            setStatus("disabled")
          } else if (data.user.deletionScheduledFor) {
            setStatus("scheduled")
            setDeletionDate(new Date(data.user.deletionScheduledFor).toDateString())
          } else {
            setStatus("active")
          }
        }
      } catch (err) {
        console.error("Failed to check account status:", err)
      } finally {
        setChecking(false)
      }
    }

    checkStatus()
  }, [user?.uid])

  const handleReactivate = async () => {
    try {
      setReactivating(true)
      const res = await fetch(`${API}/users/reactivate-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user?.uid })
      })
      const data = await res.json()
      
      if (data.success) {
        setStatus("active")
      }
    } catch (err) {
      console.error("Reactivation failed", err)
    } finally {
      setReactivating(false)
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-[100] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (status !== "active") {
    const isScheduled = status === "scheduled"
    const isDisabled = status === "disabled"

    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-[100] flex items-center justify-center p-4 bg-[url('/grid.svg')] bg-center before:absolute before:inset-0 before:bg-[#0f0f0f]/90">
        <div className="relative bg-[#181818] border border-[#262626] rounded-[24px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30 shadow-[0_0_20px_rgba(255,77,77,0.2)]">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {isScheduled ? "Account Deletion Pending" : "Account Banned"}
              </h2>
              <p className="text-white/[0.85] text-sm mt-3">
                {isScheduled 
                  ? <>Your account is scheduled to be permanently deleted on <strong>{deletionDate}</strong>. Would you like to cancel the deletion and restore your account?</>
                  : <>Your account has been <strong>permanently banned</strong> by an administrator due to a violation of our community guidelines. To appeal this ban, please email support with valid proof and reasoning.</>}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isScheduled && (
              <button
                onClick={handleReactivate}
                disabled={reactivating}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-white text-black text-sm font-bold hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                {reactivating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Cancel Deletion & Restore
              </button>
            )}
            
            {isDisabled && (
              <a 
                href="mailto:support@factflow.com?subject=Ban%20Appeal%20Request"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
              >
                Appeal Ban via Email
              </a>
            )}

            <button
              onClick={logout}
              disabled={reactivating}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-[#1f1f1f] border border-[#333] text-white/[0.85] hover:text-white hover:bg-[#262626] text-sm font-bold transition-colors disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
