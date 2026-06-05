"use client"
import { useState, useEffect, useRef } from "react"

export function useTTS(voiceSpeedSetting: string = "1x") {
  const [isPlaying, setIsPlaying] = useState(false)
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = (text: string) => {
    if (!synth) return

    // Stop anything currently speaking
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Parse the speed setting (e.g. "0.75x" -> 0.75)
    let rate = 1.0
    if (voiceSpeedSetting) {
      rate = parseFloat(voiceSpeedSetting.replace("x", "")) || 1.0
    }
    utterance.rate = rate

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    utteranceRef.current = utterance
    setIsPlaying(true)
    synth.speak(utterance)
  }

  const stop = () => {
    if (synth) {
      synth.cancel()
      setIsPlaying(false)
    }
  }

  // Ensure speech stops when the component unmounts
  useEffect(() => {
    return () => {
      if (synth) synth.cancel()
    }
  }, [synth])

  return { speak, stop, isPlaying }
}
