"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, LogOut, Trash2, Save, X, AlertTriangle, CheckCircle, Loader2, Shield, RefreshCw, KeyRound, BadgeCheck } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { auth } from "@/lib/firebase"
import { signOut, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AccountSettings() {
  const { user, logout, setUser } = useAuthStore()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)

  const [name, setName] = useState(user?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || "")

  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionStep, setActionStep] = useState<1 | 2>(1)
  const [actionType, setActionType] = useState<"deactivate" | "delete" | null>(null)
  const [actionReason, setActionReason] = useState("")
  const [actionPassword, setActionPassword] = useState("")
  const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret2FA, setSecret2FA] = useState("")
  const [token2FA, setToken2FA] = useState("")
  const [isDisabling2FA, setIsDisabling2FA] = useState(false)

  // Verification
  const [verificationStatus, setVerificationStatus] = useState<"unverified" | "pending" | "verified" | "rejected">("unverified")
  const [hasCriteriaMet, setHasCriteriaMet] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const totalViews = 0 // Mocked for now since backend doesn't aggregate views yet
  const totalLikes = 0 // Mocked for now

  // Load profile from MongoDB on mount
  useEffect(() => {
    if (!user?.uid) return
    fetch(`${API}/users/profile?firebaseUid=${user.uid}&email=${user.email}&name=${encodeURIComponent(user.displayName || "")}&avatar=${encodeURIComponent(user.photoURL || "")}`)
      .then(r => {
        if (!r.ok) throw new Error("Fetch failed")
        return r.json()
      })
      .then(data => {
        if (data.user) {
          setName(data.user.name || user.displayName || "")
          setPhone(data.user.phone || "")
          setBio(data.user.bio || "")
          setAvatarPreview(data.user.avatar || user.photoURL || "")
          
          if (data.user.deletionScheduledFor) {
            setDeletionScheduled(new Date(data.user.deletionScheduledFor).toDateString())
          }
          if (data.user.isTwoFactorEnabled) {
            setIs2FAEnabled(true)
          }
          if (data.user.verificationStatus) {
            setVerificationStatus(data.user.verificationStatus)
          } else if (data.user.isVerified) {
            setVerificationStatus("verified")
          }
          
          setFollowersCount(data.followersCount || 0)

          // Check criteria
          const isProfileComplete = 
            (data.user.name && data.user.name.length > 0) &&
            (data.user.bio && data.user.bio.length > 5) &&
            (data.user.avatar || user.photoURL);
            
          const hasNotability = (data.followersCount >= 10000) || (totalViews >= 500000) || (totalLikes >= 500000);
            
          setHasCriteriaMet(!!isProfileComplete && hasNotability)
        }
      })
      .catch(() => {})
  }, [user?.uid])

  // Save updated phone number permanently
  const handleSavePhone = async () => {
    if (!user?.uid) return
    setSaving(true)
    setErrorMsg("")
    try {
      const res = await fetch(`${API}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, email: user.email, name, phone, bio }),
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setSavedMsg("Phone number updated successfully!")
      setIsEditing(false)
      setTimeout(() => setSavedMsg(""), 3000)
    } catch (err: any) {
      setErrorMsg("Update failed: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Send password reset email via Firebase
  const handleChangePassword = async () => {
    if (!email) return
    setActionLoading(true)
    setErrorMsg("")
    try {
      await sendPasswordResetEmail(auth, email)
      setSavedMsg(`Password reset email sent to ${email}. Check your inbox!`)
      setTimeout(() => setSavedMsg(""), 5000)
    } catch (err: any) {
      setErrorMsg("Failed to send reset email: " + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle 2FA Generation
  const handleEnable2FA = async () => {
    if (!user?.uid) return
    try {
      setActionLoading(true)
      const res = await fetch(`${API}/users/2fa/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, email: user.email })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setQrCodeUrl(data.qrCodeUrl)
        setSecret2FA(data.secret)
        setIsDisabling2FA(false)
        setShow2FADialog(true)
      } else {
        setErrorMsg(data.error)
      }
    } catch (e: any) {
      setErrorMsg("Failed to setup 2FA")
    } finally {
      setActionLoading(false)
    }
  }

  // Verify or Disable 2FA
  const handleVerify2FA = async () => {
    if (!user?.uid) return
    try {
      setActionLoading(true)
      const endpoint = isDisabling2FA ? "disable" : "verify"
      const res = await fetch(`${API}/users/2fa/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, token: token2FA })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setIs2FAEnabled(!isDisabling2FA)
        setShow2FADialog(false)
        setToken2FA("")
        setSavedMsg(`Two-Factor Authentication ${isDisabling2FA ? 'disabled' : 'enabled'}!`)
        setTimeout(() => setSavedMsg(""), 3000)
      } else {
        setErrorMsg(data.error)
      }
    } catch (e: any) {
      setErrorMsg("Verification failed")
    } finally {
      setActionLoading(false)
    }
  }

  // Logout from all devices
  const handleLogoutAll = async () => {
    if (!user?.uid) return
    setActionLoading(true)
    try {
      await fetch(`${API}/users/logout-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid }),
      })
      await signOut(auth)
      logout()
      router.push("/login")
    } catch (err: any) {
      setErrorMsg("Logout failed: " + err.message)
      setActionLoading(false)
    }
  }

  const handleRequestVerification = async () => {
    if (!user?.uid) return
    if (!hasCriteriaMet) {
      setErrorMsg("You do not meet the criteria for verification. Please complete your profile.")
      return
    }
    setActionLoading(true)
    setErrorMsg("")
    try {
      const res = await fetch(`${API}/users/request-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setVerificationStatus("pending")
        setSavedMsg("Verification requested successfully! We will review your profile.")
        setTimeout(() => setSavedMsg(""), 5000)
      } else {
        setErrorMsg(data.error)
      }
    } catch (err: any) {
      setErrorMsg("Failed to request verification")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Deactivation or Deletion
  const handleAccountAction = async () => {
    if (!user?.uid || !auth.currentUser) return
    setActionLoading(true)
    setErrorMsg("")
    try {
      if (!isGoogleProvider && actionPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email!, actionPassword)
          await reauthenticateWithCredential(auth.currentUser, credential)
        } catch (authErr: any) {
          throw new Error("Incorrect password")
        }
      }

      const endpoint = actionType === "delete" ? "schedule-deletion" : "deactivate-account"
      const res = await fetch(`${API}/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firebaseUid: user.uid, 
          reason: actionReason,
        }),
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setShowDeleteDialog(false)
        await signOut(auth)
        logout()
        router.push("/login")
      } else {
        setErrorMsg(data.error || "Action failed.")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const isGoogleProvider = auth.currentUser?.providerData?.some(p => p.providerId === 'google.com')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Account & Privacy</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Manage your private credentials, security setup, and personal data visibility</p>
      </div>

      {/* Status Messages */}
      {savedMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-500/15 border border-green-500/30 rounded-xl text-green-400 text-sm animate-in fade-in duration-300">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {savedMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in fade-in duration-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Credentials Card */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[20px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        
        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Private Credentials</h3>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">Used for communications, alerts, and verification</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white rounded-xl text-sm font-semibold transition-all hover:scale-105"
              >
                Edit Phone
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="text-gray-600 dark:text-white/[0.85] text-[10px] uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-red-400" /> Primary Email
              </span>
              <p className="text-gray-900 dark:text-white font-medium">{email}</p>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="text-gray-600 dark:text-white/[0.85] text-[10px] uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-red-400" /> Phone Number
              </span>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="flex-1 px-3 py-1.5 bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-xs placeholder:text-gray-400 dark:text-white/30 focus:outline-none focus:border-red-500"
                  />
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 rounded-lg text-gray-900 dark:text-white text-xs font-semibold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSavePhone}
                    disabled={saving}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{phone || <span className="text-gray-400 dark:text-white/30 italic text-sm">Not provided</span>}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security / Password / 2FA */}
        <div className="bg-[#0f0f0f] border border-[#262626] rounded-[20px] p-6 space-y-5 shadow-lg">
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-red-500" /> Security Settings
            </h3>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs mt-1">Manage password & authentication</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-[16px] border border-[#262626] flex items-center justify-between">
            <div>
               <p className="text-gray-700 dark:text-white/80 text-sm font-bold">Two-Factor Authentication</p>
               <p className="text-gray-600 dark:text-white/[0.85] text-xs mt-0.5">{is2FAEnabled ? "Enabled" : "Disabled"}</p>
            </div>
            <button
              onClick={() => {
                if (is2FAEnabled) {
                  setIsDisabling2FA(true)
                  setShow2FADialog(true)
                } else {
                  handleEnable2FA()
                }
              }}
              disabled={actionLoading}
              className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${is2FAEnabled ? 'bg-blue-500' : 'bg-[#262626]'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${is2FAEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {isGoogleProvider ? (
            <div className="flex flex-col items-center justify-center gap-1.5 w-full py-3 bg-[#181818] border border-[#262626] rounded-[16px] text-gray-600 dark:text-white/[0.85] text-xs text-center cursor-not-allowed">
              <span className="font-bold">Managed by Google</span>
              <span className="text-[10px]">You logged in with Google, password resets are disabled.</span>
            </div>
          ) : (
            <button
              onClick={handleChangePassword}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1f1f1f] border border-[#333] rounded-[16px] text-gray-700 dark:text-white/80 hover:text-gray-900 dark:text-white hover:bg-[#262626] transition-colors text-sm font-semibold"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Send Password Reset Email
            </button>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-[#0f0f0f] border border-[#262626] rounded-[20px] p-6 space-y-5 shadow-lg">
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 text-lg">
              <BadgeCheck className="w-5 h-5 text-blue-500" /> Account Verification
            </h3>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs mt-1">Get the blue tick on your profile</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-[16px] border border-[#262626] flex items-center justify-between">
            <div>
               <p className="text-gray-700 dark:text-white/80 text-sm font-bold">Current Status</p>
               <p className={`text-xs mt-0.5 font-semibold ${
                 verificationStatus === "verified" ? "text-blue-500" :
                 verificationStatus === "pending" ? "text-orange-500" :
                 verificationStatus === "rejected" ? "text-red-500" :
                 "text-gray-500"
               }`}>
                 {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
               </p>
            </div>
            {verificationStatus === "unverified" || verificationStatus === "rejected" ? (
              <button
                onClick={handleRequestVerification}
                disabled={actionLoading || !hasCriteriaMet}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-[#262626] disabled:text-gray-500 text-white rounded-lg text-xs font-bold transition-colors"
                title={!hasCriteriaMet ? "Profile criteria not met (Name, Bio, Avatar, and 10k followers or 500k views/likes required)" : "Apply for Verification"}
              >
                Apply
              </button>
            ) : verificationStatus === "verified" ? (
              <BadgeCheck className="w-6 h-6 text-blue-500" />
            ) : null}
          </div>

          <div className="bg-[#181818] p-4 border border-[#262626] rounded-[16px] text-gray-600 dark:text-white/[0.85] text-xs space-y-2">
            <p className="font-bold">Requirements for Verification:</p>
            <ul className="list-disc pl-4 space-y-1 text-[10px]">
              <li className={hasCriteriaMet ? "text-green-500" : "text-red-400"}>Complete Profile (Name, Bio &gt; 5 chars, Avatar)</li>
              <li className={hasCriteriaMet ? "text-green-500" : "text-red-400"}>Must have at least 10,000 followers</li>
              <li>Adhere to Community Guidelines</li>
            </ul>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#0f0f0f] border border-red-500/30 rounded-[20px] p-6 space-y-5 shadow-[0_0_15px_rgba(255,77,77,0.05)]">
          <div>
            <h3 className="text-red-500 font-bold flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-red-400/60 text-xs mt-1">Irreversible account actions</p>
          </div>

          {deletionScheduled && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-[16px] text-orange-400 text-xs font-medium">
              ⚠️ Account scheduled for permanent deletion on <strong className="text-orange-300">{deletionScheduled}</strong>.
            </div>
          )}

          <div className="space-y-4 pt-2">
            <button
              onClick={handleLogoutAll}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1f1f1f] border border-[#333] rounded-[16px] text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:text-white hover:border-[#444] hover:bg-[#262626] transition-all text-sm font-semibold"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Logout from All Devices
            </button>

            <button
              onClick={() => { 
                setShowDeleteDialog(true); 
                setActionStep(1); 
                setActionType(null);
                setActionReason("");
                setActionPassword("");
              }}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#ff4d4d] to-[#ff6b6b] rounded-[16px] text-gray-900 dark:text-white hover:opacity-90 transition-all text-sm font-bold shadow-[0_0_20px_rgba(255,77,77,0.3)]"
            >
              <Trash2 className="w-4 h-4" />
              Deactivate or Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Action Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-[24px] p-8 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">
                  {actionStep === 1 ? "Account Options" : actionType === "delete" ? "Delete Account" : "Deactivate Account"}
                </h3>
                <p className="text-gray-600 dark:text-white/[0.85] text-sm mt-2">
                  {actionStep === 1 
                    ? "Choose whether you want to temporarily deactivate or permanently delete your account."
                    : actionType === "delete" 
                      ? "Your account will be permanently deleted 7 days after confirmation." 
                      : "Your account will be disabled but can be reactivated at any time."}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            {actionStep === 1 ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setActionType("deactivate")}
                  className={`p-4 rounded-[16px] border text-left transition-all ${actionType === 'deactivate' ? 'bg-[#181818] border-blue-500' : 'bg-[#181818] border-[#333] hover:border-[#444]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${actionType === 'deactivate' ? 'border-blue-500' : 'border-[#555]'}`}>
                      {actionType === 'deactivate' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold text-sm">Deactivate Account</p>
                      <p className="text-gray-600 dark:text-white/[0.85] text-xs mt-1">Temporary. You can reactivate anytime by logging in.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActionType("delete")}
                  className={`p-4 rounded-[16px] border text-left transition-all ${actionType === 'delete' ? 'bg-[#181818] border-red-500' : 'bg-[#181818] border-[#333] hover:border-[#444]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${actionType === 'delete' ? 'border-red-500' : 'border-[#555]'}`}>
                      {actionType === 'delete' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold text-sm">Delete Account</p>
                      <p className="text-gray-600 dark:text-white/[0.85] text-xs mt-1">Permanent. Deletes your data after 7 days.</p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-600 dark:text-white/[0.85] text-xs font-bold uppercase tracking-wider block text-left">Why are you leaving?</label>
                  <select 
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full px-4 py-4 bg-[#181818] border border-[#333] rounded-[16px] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none animate-none"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="privacy">Privacy concerns</option>
                    <option value="break">Taking a break</option>
                    <option value="bugs">Too many issues / bugs</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {!isGoogleProvider && (
                  <div className="space-y-2">
                    <label className="text-gray-600 dark:text-white/[0.85] text-xs font-bold uppercase tracking-wider block text-left">Password to confirm</label>
                    <input
                      type="password"
                      value={actionPassword}
                      onChange={(e) => setActionPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 bg-[#181818] border border-[#333] rounded-[16px] text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  if (actionStep === 2) {
                    setActionStep(1)
                    setErrorMsg("")
                  } else {
                    setShowDeleteDialog(false)
                    setErrorMsg("")
                  }
                }}
                className="flex-1 py-3.5 rounded-[16px] bg-[#1f1f1f] border border-[#333] text-gray-700 dark:text-white/80 hover:bg-[#262626] hover:text-gray-900 dark:text-white text-sm font-bold transition-colors"
              >
                {actionStep === 2 ? "Back" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  if (actionStep === 1) {
                    if (actionType) setActionStep(2)
                  } else {
                    handleAccountAction()
                  }
                }}
                disabled={actionLoading || (actionStep === 1 && !actionType) || (actionStep === 2 && !actionReason) || (actionStep === 2 && !isGoogleProvider && !actionPassword)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-gray-900 dark:text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'delete' && actionStep === 2 ? 'bg-[#ff4d4d] hover:bg-[#ff3333]' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {actionStep === 1 ? "Next" : actionType === "delete" ? "Delete" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup/Disable Dialog */}
      {show2FADialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-[24px] p-8 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/30">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">
                  {isDisabling2FA ? "Disable 2FA" : "Set Up 2FA"}
                </h3>
                <p className="text-gray-600 dark:text-white/[0.85] text-sm mt-2">
                  {isDisabling2FA 
                    ? "Enter your 6-digit authenticator code to disable Two-Factor Authentication."
                    : "Scan the QR code with Google Authenticator or Authy."}
                </p>
              </div>
            </div>

            {!isDisabling2FA && qrCodeUrl && (
              <div className="flex flex-col items-center gap-4 bg-[#181818] border border-[#262626] rounded-[16px] p-6">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-white/[0.85] text-xs uppercase font-bold tracking-wider mb-1">Manual Entry Key</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 select-all">{secret2FA}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-gray-600 dark:text-white/[0.85] text-xs font-bold uppercase tracking-wider block text-center">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={token2FA}
                onChange={(e) => setToken2FA(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-4 bg-[#181818] border border-[#333] rounded-[16px] text-gray-900 dark:text-white font-mono text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-white/10"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShow2FADialog(false)
                  setToken2FA("")
                }}
                className="flex-1 py-3.5 rounded-[16px] bg-[#1f1f1f] border border-[#333] text-gray-700 dark:text-white/80 hover:bg-[#262626] hover:text-gray-900 dark:text-white text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify2FA}
                disabled={actionLoading || token2FA.length !== 6}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-gray-900 dark:text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDisabling2FA 
                    ? "bg-[#ff4d4d] hover:bg-[#ff3333] shadow-[0_0_15px_rgba(255,77,77,0.4)]" 
                    : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                }`}
              >
                {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isDisabling2FA ? "Disable" : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
