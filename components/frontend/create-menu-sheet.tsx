"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Image as ImageIcon, PlaySquare } from "lucide-react"

interface CreateMenuSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: "story" | "post" | "shorts") => void
  isDark: boolean
}

export function CreateMenuSheet({ isOpen, onClose, onSelect, isDark }: CreateMenuSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl overflow-hidden pb-safe ${
              isDark ? "bg-[#111111] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
            } border-t shadow-2xl`}
          >
            {/* Handle for drag indicator */}
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className={`w-12 h-1.5 rounded-full ${isDark ? "bg-white/20" : "bg-gray-300"}`} />
            </div>

            <div className="px-6 pb-8 pt-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create</h3>
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Story Option */}
                <button 
                  onClick={() => { onSelect("story"); onClose() }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-transform active:scale-95 ${
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">Story</h4>
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>Share a quick moment with your followers</p>
                  </div>
                </button>

                {/* Post Option */}
                <button 
                  onClick={() => { onSelect("post"); onClose() }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-transform active:scale-95 ${
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">Post</h4>
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>Share a photo or article on your feed</p>
                  </div>
                </button>

                {/* News Shorts Option */}
                <button 
                  onClick={() => { onSelect("shorts"); onClose() }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-transform active:scale-95 ${
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-500 to-red-700 flex items-center justify-center text-white shrink-0 relative overflow-hidden">
                    <PlaySquare className="w-6 h-6 z-10" />
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      News Shorts
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500 text-white">Live</span>
                    </h4>
                    <p className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>Upload a vertical news video</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
