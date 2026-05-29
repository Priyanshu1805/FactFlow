"use client"

import { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { Flame, Droplets, Activity, Settings2, X, Check, Cloud, Sun, Clock, Zap, Sunrise, CircleDollarSign } from "lucide-react"
import { 
  WeatherWidget, 
  CryptoWidget, 
  ClockWidget, 
  SunriseWidget,
  DemoDetailWidget 
} from "./widget-cards"

// Define all possible widgets available in the system
const AVAILABLE_WIDGETS = [
  { id: "weather", name: "Weather & AQI", icon: Cloud, Component: WeatherWidget, props: {} },
  { id: "crypto", name: "Bitcoin (BTC)", icon: Zap, Component: CryptoWidget, props: {} },
  { id: "clock", name: "World Clock", icon: Clock, Component: ClockWidget, props: {} },
  { id: "sunrise", name: "Solar Tracking", icon: Sunrise, Component: SunriseWidget, props: {} },
  { id: "sensex", name: "BSE Sensex", icon: Activity, Component: DemoDetailWidget, props: { title: "BSE Sensex", icon: Activity, color: "green", apiType: "market", apiTarget: "^BSESN", tvSymbol: "BSE:SENSEX", baseValue: 74000, variance: 150, isUpInitial: true } },
  { id: "nifty", name: "Nifty 50", icon: Activity, Component: DemoDetailWidget, props: { title: "Nifty 50", icon: Activity, color: "green", apiType: "market", apiTarget: "^NSEI", tvSymbol: "NSE:NIFTY", baseValue: 22500, variance: 40, isUpInitial: false } },
  { id: "gold", name: "Gold (10g)", icon: Flame, Component: DemoDetailWidget, props: { title: "Gold (10g)", icon: Flame, color: "yellow", apiType: "metal", apiTarget: "gold", tvSymbol: "TVC:GOLD", baseValue: 72000, prefix: "₹", variance: 150, isUpInitial: true } },
  { id: "silver", name: "Silver (1kg)", icon: Flame, Component: DemoDetailWidget, props: { title: "Silver (1kg)", icon: Flame, color: "gray", apiType: "metal", apiTarget: "silver", tvSymbol: "TVC:SILVER", baseValue: 85000, prefix: "₹", variance: 200, isUpInitial: true } },
  { id: "usdinr", name: "USD/INR", icon: CircleDollarSign, Component: DemoDetailWidget, props: { title: "USD/INR", icon: CircleDollarSign, color: "blue", apiType: "currency", apiTarget: "INR=X", tvSymbol: "FX_IDC:USDINR", baseValue: 83.50, prefix: "₹", variance: 0.05, isUpInitial: true } },
  { id: "fuel", name: "Petrol Price", icon: Droplets, Component: DemoDetailWidget, props: { title: "Petrol", icon: Droplets, color: "orange", apiType: "fuel", apiTarget: "auto", baseValue: 104.21, prefix: "₹", suffix: "/L", variance: 0.05, isUpInitial: true } },
]

const DEFAULT_WIDGETS = ["weather", "crypto", "sensex", "gold"]

export function LiveWidgetsDashboard() {
  const containerRef = useRef<HTMLUListElement>(null)
  
  // State for which widgets are active
  const [activeIds, setActiveIds] = useState<string[]>(DEFAULT_WIDGETS)
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false) // To prevent hydration mismatch on localStorage
  const [warning, setWarning] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("factflow_widgets")
    if (saved) {
      try {
        setActiveIds(JSON.parse(saved))
      } catch (e) {}
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("factflow_widgets", JSON.stringify(activeIds))
    }
  }, [activeIds, isLoaded])

  const toggleWidget = (id: string) => {
    setActiveIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev // Prevent removing the last widget
        setWarning(null)
        return prev.filter(w => w !== id)
      }
      if (prev.length >= 4) {
        setWarning("You can select maximum 4 widgets only.")
        setTimeout(() => setWarning(null), 3000)
        return prev
      }
      setWarning(null)
      return [...prev, id]
    })
  }

  // Filter components based on active IDs (preserving the order in activeIds)
  const renderWidgets = activeIds.map(id => AVAILABLE_WIDGETS.find(w => w.id === id)).filter(Boolean)

  if (!isLoaded) return null // Wait for client render for accurate localStorage reading

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="pointer-events-auto w-full max-w-[1400px] mx-auto mt-16 px-4 pb-10 relative z-40"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            Live Info Dashboard
          </h3>
          
          {/* Gear Icon: Customize Your Space */}
          <button 
            onClick={() => setIsCustomizeOpen(true)}
            className="group flex items-center gap-2 text-sm font-semibold text-white/[0.85] bg-white/5 hover:bg-white/10 hover:text-white px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/5"
          >
            <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Customize Your Space</span>
          </button>
        </div>

        {/* 
          Single Line Horizontal Slider:
          Exactly 4 widgets visible on desktop using w-[calc(25%-...)] 
        */}
        <Reorder.Group 
          axis="x" 
          values={activeIds} 
          onReorder={setActiveIds}
          ref={containerRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence>
            {renderWidgets.map((widgetConfig: any) => {
              const { Component, props, id } = widgetConfig
              return (
                <Reorder.Item 
                  key={id}
                  value={id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, width: 0 }}
                  className="flex-none w-[85vw] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] snap-start"
                >
                  <Component {...props} />
                </Reorder.Item>
              )
            })}
          </AnimatePresence>
        </Reorder.Group>
        
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}} />
      </motion.div>

      {/* Customize Your Space Modal */}
      {isLoaded && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isCustomizeOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
                onClick={() => setIsCustomizeOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[10000] flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      <Settings2 className="w-6 h-6 text-red-500" />
                      Customize Your Space
                    </h2>
                    <p className="text-white/[0.85] text-sm mt-1">Select the widgets you want to see on your dashboard.</p>
                  </div>
                  <button onClick={() => setIsCustomizeOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Warning Banner */}
                <AnimatePresence>
                  {warning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pt-4"
                    >
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between">
                        {warning}
                        <button onClick={() => setWarning(null)}><X className="w-4 h-4 hover:text-white" /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_WIDGETS.map(widget => {
                      const isActive = activeIds.includes(widget.id)
                      return (
                        <button
                          key={widget.id}
                          onClick={() => toggleWidget(widget.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            isActive 
                              ? "bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                              : "bg-white/5 border-transparent hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isActive ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/[0.85]"}`}>
                              <widget.icon className="w-5 h-5" />
                            </div>
                            <span className={`font-semibold ${isActive ? "text-white" : "text-white/[0.85]"}`}>
                              {widget.name}
                            </span>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isActive ? "bg-red-500 text-white" : "bg-white/10 text-transparent"
                          }`}>
                            <Check className="w-4 h-4" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div className="p-6 border-t border-white/5 bg-black/50">
                  <button 
                    onClick={() => setIsCustomizeOpen(false)}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02]"
                  >
                    Save & Apply Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
