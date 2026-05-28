"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, Image as ImageIcon, Camera, Music, Type, Crop, Wand2, Hash, MapPin, Users, Settings, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

interface UploadFlowModalProps {
  isOpen: boolean
  onClose: () => void
  type: "story" | "post" | "shorts"
  isDark: boolean
}

export function UploadFlowModal({ isOpen, onClose, type, isDark }: UploadFlowModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuthStore()

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3)
    else {
      setFile(null)
      setSelectedMedia(null)
      setStep(1)
      setCaption("")
      onClose()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setSelectedMedia(URL.createObjectURL(selected))
      setStep(2)
    }
  }

  const handleShare = async () => {
    if (!file || !user) {
      toast.error("Please login and select a file")
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData
      })
      const uploadData = await uploadRes.json()
      
      if (!uploadData.success) throw new Error(uploadData.error || "Upload failed")
      
      const mediaUrl = uploadData.url
      const mediaType = uploadData.resourceType // "image" | "video"

      // 2. Create based on type
      let endpoint = "/stories"
      let payload: any = { firebaseUid: user.uid, mediaUrl, mediaType, caption }
      
      if (type === "post") {
        endpoint = "/users/post"
      } else if (type === "shorts") {
        endpoint = "/users/short"
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error("Failed to create content")
      
      toast.success(`${type === "shorts" ? "News Short" : type === "post" ? "Post" : "Story"} shared successfully!`)
      handleBack() // Reset and close
    } catch (err: any) {
      toast.error(err.message || "Failed to share")
    } finally {
      setIsUploading(false)
    }
  }

  // Dummy gallery items
  const gallery = Array.from({ length: 15 }).map((_, i) => `https://picsum.photos/400/400?random=${i}`)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed inset-0 z-[200] ${isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-gray-900"} flex flex-col`}
        >
          {/* Top Navigation Bar */}
          <div className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="p-1">
                {step === 1 ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
              </button>
              <h2 className="text-lg font-bold capitalize">
                {step === 1 ? `New ${type}` : step === 2 ? "Edit" : "New Post"}
              </h2>
            </div>
            
            {step === 1 && !selectedMedia ? null : (
              <button 
                onClick={step === 3 ? handleShare : handleNext} 
                disabled={isUploading}
                className="text-blue-500 font-bold px-4 py-1.5 hover:bg-blue-500/10 rounded-full transition-colors flex items-center gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {step === 3 ? "Share" : "Next"}
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* STEP 1: Gallery Selection */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                  <ImageIcon className={`w-10 h-10 ${isDark ? "text-white/50" : "text-gray-400"}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">Select {type === "story" ? "a photo or video" : "media"}</h3>
                <p className={`mb-8 ${isDark ? "text-white/50" : "text-gray-500"}`}>Choose from your device gallery to share.</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept={type === "shorts" ? "video/*" : "image/*,video/*"}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                >
                  Select from Device
                </button>
              </motion.div>
            )}

            {/* STEP 2: Edit */}
            {step === 2 && (
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="flex flex-col h-full">
                <div className="w-full aspect-square bg-black relative flex items-center justify-center overflow-hidden">
                   {file?.type.startsWith("video/") ? (
                     <video src={selectedMedia || ""} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                   ) : (
                     <img src={selectedMedia || ""} alt="Edit Preview" className="w-full h-full object-cover" />
                   )}
                   
                   {/* Top floating tools */}
                   <div className="absolute top-4 right-4 flex flex-col gap-4">
                     <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center">
                       <Music className="w-5 h-5" />
                     </button>
                     <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center">
                       <Type className="w-5 h-5" />
                     </button>
                   </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-around items-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500 hover:text-current cursor-pointer">
                      <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                        <Wand2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold">Filter</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-gray-500 hover:text-current cursor-pointer">
                      <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                        <Crop className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold">Crop</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Details */}
            {step === 3 && (
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="p-4 flex flex-col gap-6">
                
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black flex items-center justify-center">
                    {file?.type.startsWith("video/") ? (
                       <video src={selectedMedia || ""} className="w-full h-full object-cover" />
                     ) : (
                       <img src={selectedMedia || ""} alt="Thumbnail" className="w-full h-full object-cover" />
                     )}
                  </div>
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption or add a poll..."
                    className={`flex-1 bg-transparent border-none focus:ring-0 resize-none h-20 ${isDark ? "text-white placeholder:text-white/40" : "text-black placeholder:text-gray-400"}`}
                  />
                </div>

                {/* AI Assist Buttons */}
                <div className="flex gap-2 px-2">
                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={async () => {
                      setIsGeneratingAI(true);
                      try {
                        const res = await fetch("/api/ai", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            model: "free-unlimited",
                            query: `Write a single catchy, premium, short social media caption (1-2 sentences maximum, without any hashtags) for a ${type} about: "${caption || "a new video/photo upload"}"`
                          })
                        });
                        if (!res.ok) throw new Error();
                        const reader = res.body?.getReader();
                        const decoder = new TextDecoder();
                        setCaption("");
                        while (true) {
                          const { done, value } = await reader!.read();
                          if (done) break;
                          setCaption(prev => prev + decoder.decode(value));
                        }
                        toast.success("AI Caption generated!");
                      } catch {
                        toast.error("AI Generation failed. Check API connection.");
                      } finally {
                        setIsGeneratingAI(false);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark 
                        ? "bg-purple-950/20 border-purple-500/30 text-purple-400 hover:bg-purple-900/30" 
                        : "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Caption
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={async () => {
                      if (!caption.trim()) {
                        toast.error("Please write a short caption first so the AI knows what tags to make!");
                        return;
                      }
                      setIsGeneratingAI(true);
                      try {
                        const res = await fetch("/api/ai", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            model: "free-unlimited",
                            query: `For this social media caption: "${caption}", generate exactly 5-8 matching trending hashtags. Output ONLY the hashtags separated by spaces, no other text.`
                          })
                        });
                        if (!res.ok) throw new Error();
                        const reader = res.body?.getReader();
                        const decoder = new TextDecoder();
                        let tags = "";
                        while (true) {
                          const { done, value } = await reader!.read();
                          if (done) break;
                          tags += decoder.decode(value);
                        }
                        setCaption(prev => prev + "\n\n" + tags.trim());
                        toast.success("AI Hashtags added!");
                      } catch {
                        toast.error("AI Generation failed. Check API connection.");
                      } finally {
                        setIsGeneratingAI(false);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isDark 
                        ? "bg-blue-950/20 border-blue-500/30 text-blue-400 hover:bg-blue-900/30" 
                        : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    AI Hashtags
                  </button>
                </div>


                <div className={`space-y-4 border-t pt-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                  <button className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">Tag people</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  <button className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">Add location</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  {type === "shorts" && (
                    <button className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-500">News Category</span>
                      </div>
                      <span className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>Select &gt;</span>
                    </button>
                  )}
                </div>

                {/* Advanced Settings Accordion (Dummy) */}
                <div className={`mt-4 border-t pt-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                  <button className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">Advanced settings</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

              </motion.div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ChevronDownIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

function ArrowRightIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  )
}
