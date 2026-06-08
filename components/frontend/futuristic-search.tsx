"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Mic, Camera, Plus, Send, X, Bot, ChevronDown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { AccessibleImage as Image } from "@/components/frontend/accessible-image"
import { useTheme } from "@/components/theme-provider"

const AI_MODELS = [
  { id: "free-unlimited", name: "Pollinations AI (Free)" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" }
]

export function FuturisticSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [aiMode, setAiMode] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id)
  const [showModelMenu, setShowModelMenu] = useState(false)

  // File Upload & Camera State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  // AI Response State
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [response, setResponse] = useState("")
  
  // Voice Recognition State
  const [isListening, setIsListening] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme !== "light"

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === "Escape") closeSearch()
    }

    const handleCustomEvent = () => setIsOpen(true)

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("open-futuristic-search", handleCustomEvent)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open-futuristic-search", handleCustomEvent)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const closeSearch = () => {
    setIsOpen(false)
    setQuery("")
    setResponse("")
    setIsTyping(false)
    setIsAnalyzingImage(false)
    setUploadedImage(null)
    setShowModelMenu(false)
    stopCamera()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.")
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraActive(true)
      setUploadedImage(null)
    } catch (err) {
      console.error("Camera access denied or failed", err)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const imgData = canvas.toDataURL("image/jpeg")
        setUploadedImage(imgData)
        stopCamera()
        // Auto-trigger search after capturing photo
        setTimeout(() => handleSearch(undefined, imgData), 50)
      }
    }
  }

  // --- VOICE SEARCH (Web Speech API) ---
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Search. Please use Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setQuery("") // Clear current query
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      // Auto trigger search after voice input
      setTimeout(() => {
        if (inputRef.current) {
          // Manually trigger the form submit logic
          handleSearch(undefined, undefined, transcript)
        }
      }, 500)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSearch = async (e?: React.FormEvent, directImage?: string, directQuery?: string) => {
    if (e) e.preventDefault()
    
    const imgToUse = directImage || uploadedImage
    const queryToUse = directQuery || query

    if ((!queryToUse.trim() && !imgToUse) || isTyping || isAnalyzingImage) return

    // 1. WEB MODE WITH IMAGE -> Image to Text to Web Search
    if (!aiMode && imgToUse) {
      setIsAnalyzingImage(true)
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: "Identify the main specific product or subject in this image in 1 to 4 words max. Just output the keywords, no punctuation or sentences.", 
            model: "free-unlimited", // Prefer free vision API if possible, otherwise we fallback to Gemini
            image: imgToUse 
          }),
        })
        if (!res.ok) throw new Error("Vision analysis failed")
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let detectedText = ""
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            detectedText += decoder.decode(value, { stream: true })
          }
        }
        detectedText = detectedText.trim().replace(/[^a-zA-Z0-9\s]/g, "")
        const finalSearchQuery = queryToUse.trim() ? `${queryToUse} ${detectedText}` : detectedText
        router.push(`/search?q=${encodeURIComponent(finalSearchQuery)}`)
        closeSearch()
      } catch (err) {
        console.error(err)
        alert("Failed to analyze image for web search.")
        setIsAnalyzingImage(false)
      }
      return
    }

    // 2. STANDARD WEB SEARCH
    if (!aiMode) {
      router.push(`/search?q=${encodeURIComponent(queryToUse)}`)
      closeSearch()
      return
    }

    // 3. AI CHAT MODE
    setIsTyping(true)
    setResponse("")
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: queryToUse, 
          model: selectedModel,
          image: imgToUse 
        }),
      })

      if (!res.ok) {
        const errTxt = await res.text()
        throw new Error(errTxt || "AI Backend Error")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setResponse(prev => prev + decoder.decode(value, { stream: true }))
        }
      }
    } catch (error: any) {
      console.error("AI Error:", error)
      setResponse(error.message || "System offline. Could not connect to AI Neural Network.")
    } finally {
      setIsTyping(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Dark overlay background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] bg-black/60 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSearch()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl flex flex-col"
        >
          {/* UIVERSE CHAT BOT UI CONTAINER */}
          <div className="relative flex bg-gradient-to-br from-[#7e7e7e] via-[#363636] to-[#363636] rounded-2xl p-[1.5px] overflow-hidden shadow-2xl">
            {/* Top-Left Glowing Orb */}
            <div className="absolute -top-[10px] -left-[10px] bg-[radial-gradient(ellipse_at_center,#ffffff,rgba(255,255,255,0.3),rgba(255,255,255,0.1),transparent_70%)] w-[40px] h-[40px] blur-[2px]" />
            
            {/* Inner Chat Container */}
            <div className="flex flex-col bg-black/90 rounded-[15px] w-full overflow-hidden relative z-10 backdrop-blur-xl">
              
              {/* AI Response Area */}
              <AnimatePresence>
                {aiMode && (response || isTyping) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden border-b border-[#363636]"
                  >
                    <div className="p-6 flex gap-4 max-h-[50vh] overflow-y-auto">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-base leading-relaxed whitespace-pre-wrap text-[#f3f6fd]">
                        {response}
                        {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-[#ffffff] animate-pulse align-middle" />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera Viewfinder */}
              {isCameraActive && (
                <div className="relative w-full bg-black flex flex-col items-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full max-h-[40vh] object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button 
                      onClick={stopCamera}
                      className="px-4 py-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={captureImage}
                      className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold transition-colors shadow-lg"
                    >
                      Snap Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Main Search Input Form */}
              <form onSubmit={handleSearch} className="flex flex-col w-full relative z-10">
                
                {/* Uploaded Image Chip Preview */}
                {uploadedImage && !isCameraActive && (
                  <div className="px-5 pt-4 pb-2">
                    <div className="relative inline-flex items-center gap-3 p-1.5 pr-4 rounded-xl border bg-[#1b1b1b] border-[#363636]">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                        <Image src={uploadedImage} alt="Attachment" fill className="object-cover" />
                      </div>
                      <span className="text-sm font-medium text-white/[0.85]">Attached Image</span>
                      <button
                        type="button"
                        onClick={() => setUploadedImage(null)}
                        className="ml-2 p-1 bg-black/40 hover:bg-red-500/80 text-white rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="relative flex px-2 pt-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={aiMode ? "Ask the AI Assistant..." : "Search Google, Shopping, News..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isTyping || isAnalyzingImage}
                    className="w-full h-[50px] bg-transparent text-[#ffffff] border-none outline-none resize-none px-4 py-2 font-sans text-base placeholder-[#f3f6fd] transition-colors focus:placeholder-[#363636]"
                  />
                </div>

                {/* Options Area */}
                <div className="flex justify-between items-end p-3 px-4">
                  
                  {/* Left Side Add-ons */}
                  <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white/30 hover:text-white hover:-translate-y-1 transition-all duration-300"
                      title="Upload Image"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={isCameraActive ? stopCamera : startCamera}
                      className={`transition-all duration-300 ${isCameraActive ? "text-red-500" : "text-white/30 hover:text-white hover:-translate-y-1"}`}
                      title="Open Camera"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={startVoiceSearch}
                      className={`transition-all duration-300 ${isListening ? "text-red-500 animate-pulse" : "text-white/30 hover:text-white hover:-translate-y-1"}`}
                      title="Voice Search"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Right Side Submit */}
                  <div className="flex items-center gap-4">
                    
                    {/* Custom Fact Flow AI Toggle (Styled to match the tags) */}
                    <button
                      type="button"
                      onClick={() => setAiMode(!aiMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border-[1.5px] cursor-pointer select-none transition-colors text-[11px] font-bold tracking-wider ${
                        aiMode 
                          ? "bg-[#363636] border-[#555] text-white"
                          : "bg-[#1b1b1b] border-[#363636] text-white/70"
                      }`}
                      title="Toggle Fact Flow Neural AI"
                    >
                      <Bot className={`w-3 h-3 ${aiMode ? "text-purple-400" : "text-gray-400"}`} />
                      {aiMode ? "AI ACTIVE" : "WEB SEARCH"}
                    </button>

                    <button 
                      type="submit"
                      disabled={(!query.trim() && !uploadedImage) || isTyping || isAnalyzingImage}
                      className="flex p-[2px] bg-gradient-to-t from-[#292929] via-[#555] to-[#292929] rounded-[10px] shadow-[inset_0_6px_2px_-4px_rgba(255,255,255,0.5)] cursor-pointer outline-none transition-all duration-150 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-[34px] h-[34px] p-1.5 bg-black/10 rounded-[10px] backdrop-blur-[3px] text-[#8b8b8b] flex items-center justify-center">
                        {isAnalyzingImage ? (
                           <Loader2 className="w-full h-full animate-spin text-white" />
                        ) : (
                           <Send className="w-full h-full transition-all duration-300 group-hover:text-[#f3f6fd] group-hover:drop-shadow-[0_0_5px_#fff] group-focus:scale-110 group-focus:-rotate-12" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Tags (Model Selector) */}
          <AnimatePresence>
            {aiMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex gap-2 py-2 overflow-x-auto text-white text-[10px] font-medium"
              >
                {AI_MODELS.map(model => (
                  <span
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`px-3 py-1.5 rounded-[10px] border-[1.5px] cursor-pointer select-none whitespace-nowrap transition-colors ${
                      selectedModel === model.id
                        ? "bg-[#363636] border-[#555] text-white"
                        : "bg-[#1b1b1b] border-[#363636] text-white/50 hover:text-white"
                    }`}
                  >
                    {model.name}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
