"use client"

import { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useTheme } from "@/components/theme-provider"

interface AISummaryButtonProps {
  articleText: string
}

export function AISummaryButton({ articleText }: AISummaryButtonProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const { theme } = useTheme()
  const isDark = theme !== "light"

  const handleSummarize = async () => {
    if (summary) {
      setExpanded(!expanded)
      return
    }

    if (!articleText || articleText.length < 50) {
      toast.error("Article too short to summarize")
      return
    }

    setLoading(true)
    setExpanded(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/ollama/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText.substring(0, 4000) }) // Send up to 4000 chars to avoid token limits
      })

      if (!res.ok) throw new Error("API request failed")
      
      const data = await res.json()
      if (data.success && data.data) {
        setSummary(data.data)
      } else {
        throw new Error(data.error || "Failed to generate summary")
      }
    } catch (err: any) {
      console.error(err)
      toast.error("AI Summary failed", { description: err.message })
      setExpanded(false)
    } finally {
      setLoading(false)
    }
  }

  // Split summary into bullet points if it contains hyphens or asterisks
  const renderSummary = () => {
    if (!summary) return null
    
    // Attempt to split by common bullet point markers
    const points = summary.split(/\n-|\n\*/).filter(p => p.trim().length > 0)
    
    if (points.length > 1) {
      return (
        <ul className="space-y-3 list-none">
          {points.map((point, idx) => {
            const cleanPoint = point.replace(/^- |^\* /, "").trim()
            return (
              <li key={idx} className="flex gap-3">
                <span className="text-purple-500 mt-1 flex-shrink-0">✦</span>
                <span>{cleanPoint}</span>
              </li>
            )
          })}
        </ul>
      )
    }
    
    return <p className="leading-relaxed">{summary}</p>
  }

  return (
    <div className="my-6">
      <button
        onClick={handleSummarize}
        disabled={loading}
        className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
          isDark 
            ? "bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20" 
            : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
        } ${loading ? "cursor-wait" : "active:scale-95"}`}
      >
        <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : "group-hover:animate-pulse"}`} />
        {loading ? "Generating Magic..." : summary ? (expanded ? "Hide AI Summary" : "View AI Summary") : "✨ AI Summarize"}
        {summary && !loading && (
          expanded ? <ChevronUp className="w-4 h-4 ml-1 opacity-70" /> : <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
        )}
        
        {/* Glow effect */}
        {!summary && !loading && (
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className={`relative p-6 rounded-2xl border shadow-lg backdrop-blur-md ${
              isDark 
                ? "bg-[#111] border-purple-500/20 shadow-purple-500/5 text-gray-200" 
                : "bg-white border-purple-100 shadow-purple-500/5 text-gray-800"
            }`}>
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-24 h-24 text-purple-500" />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-1.5 rounded-md ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                  <Sparkles className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <h3 className={`font-bold tracking-tight ${isDark ? "text-purple-300" : "text-purple-800"}`}>
                  AI Quick Digest
                </h3>
              </div>

              {loading ? (
                <div className="space-y-3 py-2">
                  <div className={`h-4 w-3/4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                  <div className={`h-4 w-full rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                  <div className={`h-4 w-5/6 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                </div>
              ) : (
                <div className="relative z-10 text-[0.95rem] font-medium">
                  {renderSummary()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
