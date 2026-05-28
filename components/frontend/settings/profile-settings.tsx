"use client"

import { useState, useEffect, useRef } from "react"
import { User, Camera, Save, X, AlertTriangle, CheckCircle, Loader2, FileText, Edit3, AtSign } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function ProfileSettings() {
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.displayName || "")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Load profile from MongoDB on mount
  useEffect(() => {
    if (!user?.uid) return
    fetch(`${API}/users/profile?firebaseUid=${user.uid}&email=${user.email}&name=${encodeURIComponent(user.displayName || "")}&avatar=${encodeURIComponent(user.photoURL || "")}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setName(data.user.name || user.displayName || "")
          setBio(data.user.bio || "")
          setUsername(data.user.username || "")
          
          if (data.user.avatar) {
            setAvatarPreview(data.user.avatar)
          } else if (user.photoURL) {
            setAvatarPreview(user.photoURL)
          }
        }
      })
      .catch(() => {})
  }, [user?.uid])

  useEffect(() => {
    if (user?.photoURL && !avatarPreview) {
      setAvatarPreview(user.photoURL)
    }
  }, [user?.photoURL])

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile || !user?.uid) return
    setSavingAvatar(true)
    setErrorMsg("")
    try {
      const formData = new FormData()
      formData.append("avatar", selectedFile)
      formData.append("firebaseUid", user.uid)

      const res = await fetch(`${API}/users/avatar`, { method: "POST", body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setAvatarPreview(data.avatarUrl)
      setSelectedFile(null)
      setUser({ ...user, photoURL: data.avatarUrl })
      setSavedMsg("Profile picture updated!")
      setTimeout(() => setSavedMsg(""), 3000)
    } catch (err: any) {
      setErrorMsg("Avatar upload failed: " + err.message)
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.uid) return
    setSaving(true)
    setErrorMsg("")
    try {
      const res = await fetch(`${API}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, email: user.email, name, username, bio }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setUser({ ...user, displayName: name, username })
      setSavedMsg("Profile saved successfully!")
      setIsEditing(false)
      setTimeout(() => setSavedMsg(""), 3000)
    } catch (err: any) {
      setErrorMsg("Save failed: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Public Profile</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Manage how you appear to others on Fact Flow</p>
      </div>

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

      {!isEditing ? (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[20px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Avatar & Photo Uploder */}
            <div className="flex flex-col items-center text-center space-y-5 min-w-[220px]">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-gray-900 dark:text-white text-4xl font-bold border-4 border-gray-200 dark:border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
                    >
                      <Camera className="w-7 h-7 text-gray-900 dark:text-white mb-1" />
                      <span className="text-[10px] text-gray-900 dark:text-white font-bold absolute bottom-4 uppercase tracking-wider">Change</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                  </>
                )}
              </div>

              {selectedFile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={savingAvatar}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-gray-900 dark:text-white text-sm rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60"
                >
                  {savingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingAvatar ? "Uploading..." : "Save Photo"}
                </button>
              )}

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{name || "Fact Flow User"}</h3>
                {username && <p className="text-red-400 text-sm mt-0.5 font-semibold">@{username}</p>}
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 w-full space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-white/10 pb-5 gap-4">
                <div>
                  <h4 className="text-gray-900 dark:text-white font-bold text-lg">Public Details</h4>
                  <p className="text-gray-600 dark:text-white/[0.85] text-xs mt-1">This info is visible to everyone on Fact Flow</p>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white text-sm rounded-xl font-semibold transition-all hover:scale-105"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-600 dark:text-white/[0.85] text-[10px] uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                    <User className="w-3 h-3"/> Full Name
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">{name || <span className="text-gray-400 dark:text-white/30 italic text-sm">Not provided</span>}</p>
                </div>
                <div className="bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-600 dark:text-white/[0.85] text-[10px] uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5">
                    <AtSign className="w-3 h-3"/> Username
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">{username ? `@${username}` : <span className="text-gray-400 dark:text-white/30 italic text-sm">Not set</span>}</p>
                </div>
              </div>

              <div className="bg-white/[0.03] p-5 rounded-xl border border-gray-100 dark:border-white/5">
                <p className="text-gray-600 dark:text-white/[0.85] text-[10px] uppercase tracking-widest font-bold mb-2">About Me</p>
                <p className="text-gray-700 dark:text-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {bio || <span className="text-gray-400 dark:text-white/30 italic">No bio provided yet. Click "Edit Profile" to tell the world about yourself!</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form Mode */
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[20px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-gray-100 dark:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-gray-600 dark:text-white/[0.85] text-xs font-bold uppercase tracking-wider mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-white/[0.85]" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:text-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-600 dark:text-white/[0.85] text-xs font-bold uppercase tracking-wider mb-2 block">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-white/[0.85]" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="username"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:text-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-600 dark:text-white/[0.85] text-xs font-bold uppercase tracking-wider mb-2 block">Bio / About Me</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-600 dark:text-white/[0.85]" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:text-white/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                />
              </div>
              <p className={`text-right text-[10px] mt-1.5 font-medium ${bio.length >= 200 ? 'text-red-400' : 'text-gray-600 dark:text-white/[0.85]'}`}>
                {bio.length} / 200 characters
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-white dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#ff512f] to-[#dd2476] hover:opacity-90 text-gray-900 dark:text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
