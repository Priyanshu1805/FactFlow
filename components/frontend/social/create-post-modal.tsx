"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, Image as ImageIcon, MapPin, Hash, Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
}

export function CreatePostModal({ isOpen, onClose, isDark }: CreatePostModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [caption, setCaption] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [location, setLocation] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()

  const handleBack = () => {
    if (step > 1) setStep(1)
    else resetAndClose()
  }

  const resetAndClose = () => {
    setFiles([])
    previews.forEach((p) => URL.revokeObjectURL(p))
    setPreviews([])
    setCurrentPreviewIndex(0)
    setCaption("")
    setHashtags("")
    setLocation("")
    setStep(1)
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).slice(0, 10) // Max 10 files
      setFiles(selectedFiles)
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
      setPreviews(newPreviews)
      setStep(2)
    }
  }

  const handleShare = async () => {
    if (files.length === 0 || !user?.uid) {
      toast.error("Please login and select at least one file")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("firebaseUid", user.uid)
      formData.append("caption", caption)
      formData.append("hashtags", hashtags)
      formData.append("location", location)

      files.forEach((file) => {
        formData.append("media", file)
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/posts/create`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to post")

      toast.success("Post published successfully!")
      resetAndClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to share post")
    } finally {
      setIsUploading(false)
    }
  }

  const nextPreview = () => {
    if (currentPreviewIndex < previews.length - 1) setCurrentPreviewIndex((prev) => prev + 1)
  }

  const prevPreview = () => {
    if (currentPreviewIndex > 0) setCurrentPreviewIndex((prev) => prev - 1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed inset-0 z-[200] ${isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-gray-900"} flex flex-col md:items-center md:justify-center md:bg-black/80 md:backdrop-blur-sm`}
        >
          <div className={`flex flex-col w-full h-full md:w-[800px] md:h-[600px] md:rounded-2xl overflow-hidden shadow-2xl ${isDark ? "md:bg-[#1a1a1a]" : "md:bg-white"}`}>
            
            {/* Header */}
            <div className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <button onClick={handleBack} className="p-1 hover:opacity-70 transition-opacity">
                  {step === 1 ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                </button>
                <h2 className="text-lg font-bold">Create new post</h2>
              </div>
              {step === 2 && (
                <button
                  onClick={handleShare}
                  disabled={isUploading}
                  className="text-blue-500 font-bold px-4 py-1.5 hover:bg-blue-500/10 rounded-full transition-colors flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Share"}
                </button>
              )}
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col md:flex-row">
              
              {/* STEP 1: Gallery Selection */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                    <ImageIcon className={`w-10 h-10 ${isDark ? "text-white/50" : "text-gray-400"}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Drag photos and videos here</h3>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors active:scale-95"
                  >
                    Select from computer
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Details & Preview */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row w-full h-full">
                  
                  {/* Media Preview Slider */}
                  <div className="relative w-full md:w-[60%] aspect-square md:aspect-auto bg-black flex items-center justify-center overflow-hidden">
                    {files[currentPreviewIndex]?.type.startsWith("video/") ? (
                      <video src={previews[currentPreviewIndex]} className="w-full h-full object-contain" controls autoPlay loop muted playsInline />
                    ) : (
                      <img src={previews[currentPreviewIndex]} alt="Preview" className="w-full h-full object-contain" />
                    )}

                    {previews.length > 1 && (
                      <>
                        {currentPreviewIndex > 0 && (
                          <button onClick={prevPreview} className="absolute left-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        )}
                        {currentPreviewIndex < previews.length - 1 && (
                          <button onClick={nextPreview} className="absolute right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        )}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {previews.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentPreviewIndex ? "bg-blue-500" : "bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sidebar Details */}
                  <div className={`w-full md:w-[40%] flex flex-col border-l ${isDark ? "border-white/10" : "border-gray-200"}`}>
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-purple-600">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {(user?.displayName || "U").charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-sm">{user?.displayName}</span>
                    </div>

                    {/* Caption Input */}
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write a caption..."
                      className={`w-full h-32 px-4 py-2 bg-transparent border-none focus:ring-0 resize-none text-sm ${isDark ? "text-white placeholder:text-white/40" : "text-black placeholder:text-gray-400"}`}
                    />

                    {/* Meta Inputs */}
                    <div className="px-4 py-2 flex flex-col gap-3">
                      <div className={`flex items-center border-b pb-2 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                        <Hash className="w-5 h-5 opacity-50 mr-2" />
                        <input
                          type="text"
                          value={hashtags}
                          onChange={(e) => setHashtags(e.target.value)}
                          placeholder="Hashtags (comma separated)"
                          className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                        />
                      </div>
                      <div className={`flex items-center border-b pb-2 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                        <MapPin className="w-5 h-5 opacity-50 mr-2" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Add location"
                          className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Uploading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[300] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-bold">Publishing your post...</p>
                <p className="text-xs opacity-70 mt-2">This might take a moment for videos.</p>
              </div>
            )}
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
