"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Shield, Loader2, ArrowRight } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function TwoFactorGuard({ children }: { children: React.ReactNode }) {
  const { user, is2faVerified, set2faVerified, logout } = useAuthStore()
  const [checking, setChecking] = useState(false)
  const [needs2FA, setNeeds2FA] = useState(false)
  
  console.log("[TwoFactorGuard] checking:", checking, "needs2FA:", needs2FA)
  
  const [token, setToken] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function check2FA() {
      if (!user?.uid) {
        setChecking(false)
        return
      }

      if (is2faVerified) {
        setNeeds2FA(false)
        setChecking(false)
        return
      }

      try {
        const res = await fetch(`${API}/users/profile?firebaseUid=${user.uid}`)
        const data = await res.json()
        
        if (data.success && data.user?.isTwoFactorEnabled) {
          setNeeds2FA(true)
        } else {
          setNeeds2FA(false)
        }
      } catch (err) {
        console.error("Failed to check 2FA status:", err)
      } finally {
        setChecking(false)
      }
    }

    check2FA()
  }, [user?.uid, is2faVerified])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (token.length !== 6) return
    
    setVerifying(true)
    setError("")
    
    try {
      const res = await fetch(`${API}/users/2fa/verify-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user?.uid, token })
      })
      const data = await res.json()
      
      if (data.success) {
        set2faVerified(true)
        setNeeds2FA(false)
      } else {
        setError(data.error || "Invalid code")
        setToken("")
      }
    } catch (err: any) {
      setError("Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-[100] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (needs2FA) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-[100] flex items-center justify-center p-4 bg-[url('/grid.svg')] bg-center before:absolute before:inset-0 before:bg-[#0f0f0f]/90">
        <div className="relative bg-[#181818] border border-[#262626] rounded-[24px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Two-Step Verification</h2>
              <p className="text-white/[0.85] text-sm mt-2">Enter the 6-digit code from your authenticator app to continue.</p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <input
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-4 bg-[#0f0f0f] border border-[#333] rounded-[16px] text-white font-mono text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-white/10"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={logout}
                className="flex-1 py-3.5 rounded-[16px] bg-[#1f1f1f] border border-[#333] text-white/[0.85] hover:text-white hover:bg-[#262626] text-sm font-bold transition-colors"
              >
                Sign Out
              </button>
              <button
                type="submit"
                disabled={token.length !== 6 || verifying}
                className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-[16px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:shadow-none"
              >
                {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                Verify Code
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
