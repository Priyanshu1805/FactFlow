"use client"

import { useState, useEffect, useRef } from "react"
import { X, Camera, Save, Loader2, User, FileText, AtSign, AlertTriangle } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedUser: any) => void
  isDark: boolean
}

export function EditProfileModal({ isOpen, onClose, onSuccess, isDark }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.displayName || "")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || "")
  const [coverPreview, setCoverPreview] = useState("")
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingCover, setSavingCover] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Load profile from MongoDB on mount
  useEffect(() => {
    if (!user?.uid || !isOpen) return
    fetch(`${API}/users/profile?firebaseUid=${user.uid}&email=${user.email}&name=${encodeURIComponent(user.displayName || "")}&avatar=${encodeURIComponent(user.photoURL || "")}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setName(data.user.name || user.displayName || "")
          setBio(data.user.bio || "")
          setUsername(data.user.username || "")
          setAvatarPreview(data.user.avatar || user.photoURL || "")
          setCoverPreview(data.user.coverImage || "")
        }
      })
      .catch(() => {})
  }, [user?.uid, isOpen])

  if (!isOpen) return null

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile || !user?.uid) return
    setSavingAvatar(true)
    setErrorMsg("")
    try {
      const formData = new FormData()
      formData.append("avatar", selectedAvatarFile)
      formData.append("firebaseUid", user.uid)

      const res = await fetch(`${API}/users/avatar`, { method: "POST", body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setAvatarPreview(data.avatarUrl)
      setSelectedAvatarFile(null)
      setUser({ ...user, photoURL: data.avatarUrl })
      onSuccess({ avatar: data.avatarUrl })
    } catch (err: any) {
      setErrorMsg("Avatar upload failed: " + err.message)
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleCoverUpload = async () => {
    if (!selectedCoverFile || !user?.uid) return
    setSavingCover(true)
    setErrorMsg("")
    try {
      const formData = new FormData()
      formData.append("cover", selectedCoverFile)
      formData.append("firebaseUid", user.uid)

      const res = await fetch(`${API}/users/cover`, { method: "POST", body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setCoverPreview(data.coverUrl)
      setSelectedCoverFile(null)
      onSuccess({ coverImage: data.coverUrl })
    } catch (err: any) {
      setErrorMsg("Cover upload failed: " + err.message)
    } finally {
      setSavingCover(false)
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

      const updated = { ...user, displayName: name, username }
      setUser(updated)
      onSuccess({ name, username, bio })
      onClose()
    } catch (err: any) {
      setErrorMsg("Save failed: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`border rounded-[24px] p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 ${
        isDark ? "bg-[#0f0f0f] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" : "bg-white border-gray-200 text-gray-900"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Cover Photo Uploader */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest block mb-1">Cover Image</label>
          <div className="relative group w-full h-28 rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs opacity-35">No cover banner set</span>
            )}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Camera className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
          </div>
          {selectedCoverFile && (
            <button
              onClick={handleCoverUpload}
              disabled={savingCover}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-xs rounded-lg font-bold disabled:opacity-60"
            >
              {savingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Cover Banner
            </button>
          )}
        </div>

        {/* Avatar Uploader */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-[10px] uppercase font-bold tracking-widest block self-start">Profile Photo</label>
          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-gray-900 dark:text-white text-2xl font-bold border-2 border-gray-200 dark:border-white/10 shadow-lg transition-transform duration-300 hover:scale-105">
              {avatarPreview ? (
                <img src={avatarPreview} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{(name || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <Camera className="w-5 h-5 text-gray-900 dark:text-white" />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
          </div>

          {selectedAvatarFile && (
            <button
              onClick={handleAvatarUpload}
              disabled={savingAvatar}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-xs rounded-lg font-bold transition-colors disabled:opacity-60"
            >
              {savingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile Photo
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm placeholder:text-gray-300 dark:text-white/20 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest block mb-1">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                placeholder="username"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm placeholder:text-gray-300 dark:text-white/20 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest block mb-1">Bio</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 opacity-50" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm placeholder:text-gray-300 dark:text-white/20 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
            <p className="text-right text-[9px] opacity-50 mt-1">{bio.length} / 200</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 text-gray-900 dark:text-white hover:opacity-95 transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
