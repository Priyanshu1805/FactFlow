"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()} 
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  )
}
