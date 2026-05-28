"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Video, Loader2 } from "lucide-react"

export function UploadReelModal({ isOpen, onClose, onUploadSuccess }: { isOpen: boolean, onClose: () => void, onUploadSuccess: (newReel: any) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("video", file)
    formData.append("title", title)
    formData.append("description", description)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reels/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        onUploadSuccess(data.data)
        onClose()
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      setError("An error occurred during upload.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-bold text-lg">Upload Local Event</h2>
              <button onClick={onClose} className="text-white/[0.85] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* File Upload Zone */}
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                  required
                />
                <div className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${file ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 bg-white/5 hover:border-red-500/50'}`}>
                  {file ? (
                    <>
                      <Video className="w-8 h-8 text-green-400" />
                      <p className="text-sm font-semibold text-green-400">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-white/[0.85]" />
                      <p className="text-sm font-semibold text-white/[0.85]">Click or drag a video file</p>
                      <p className="text-xs text-white/[0.85]">MP4, WebM up to 50MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Caption / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="What's happening?"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 transition-colors resize-none h-24"
                  placeholder="Add more details about this event..."
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !file || !title}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Share Reel"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
