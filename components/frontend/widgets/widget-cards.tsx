"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Clock, Cloud, Sun, MapPin, Activity, Droplets, Wind, Zap, Fuel, Info, Calendar, X, ArrowRightLeft, Sunrise, Sunset, Flame, Trophy } from "lucide-react"
import { getUserLocation, getWeather, getCryptoPrices, getMarketData, getMetalPrice, getCurrencyRate, getFuelPrice, getIndianMetalPrice, getCricketScore } from "@/lib/api/widgets"

// --- Helper Hooks ---

export function useOscillatingNumber(baseNumber: number, variance: number, intervalMs = 3000) {
  const [value, setValue] = useState(baseNumber)
  
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() * variance * 2) - variance
      setValue(prev => {
        const newValue = prev + change
        if (newValue > baseNumber + variance * 5) return prev - Math.abs(change)
        if (newValue < baseNumber - variance * 5) return prev + Math.abs(change)
        return newValue
      })
    }, intervalMs)
    return () => clearInterval(interval)
  }, [baseNumber, variance, intervalMs])

  return value
}

// --- Tailwind Safe Color Maps ---
const bgColors: Record<string, string> = {
  red: "bg-red-500/20",
  orange: "bg-orange-500/20",
  yellow: "bg-yellow-500/20",
  green: "bg-green-500/20",
  blue: "bg-blue-500/20",
  gray: "bg-gray-500/20",
}

const textColors: Record<string, string> = {
  red: "text-red-400",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  blue: "text-blue-400",
  gray: "text-gray-400",
}

// --- Detail Modal ---

function DetailModal({ isOpen, onClose, title, icon: Icon, color, children }: any) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null
  
  // Render over everything, fixed to screen. Use createPortal to escape parent transforms.
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col`}
      >
        <div className={`absolute top-0 left-0 right-0 h-32 ${bgColors[color] || bgColors.red} blur-[50px] pointer-events-none`} />
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${bgColors[color] || bgColors.red} ${textColors[color] || textColors.red}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/[0.85] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// --- Generic Widget Wrapper ---

export function WidgetCard({ title, icon: Icon, children, isLive = false, color = "red", onClick }: any) {
  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-[20px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-4 flex flex-col justify-between h-[140px] w-full snap-center group cursor-pointer hover:bg-white/10 transition-colors"
      onClick={onClick}
    >
      
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center gap-1.5">
          <div className={`p-1.5 rounded-full ${bgColors[color] || bgColors.red} ${textColors[color] || textColors.red}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-white/[0.85] tracking-wider uppercase">{title}</span>
        </div>
        {isLive && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-red-400 uppercase">Live</span>
          </span>
        )}
      </div>
      
      <div className="z-10 flex-1 flex flex-col justify-end">
        {children}
      </div>
    </motion.div>
  )
}

// --- Specific Widgets ---

export function WeatherWidget() {
  const [data, setData] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const loc = await getUserLocation()
        const weather = await getWeather(loc.lat, loc.lon)
        setData({
          ...weather,
          city: loc.city,
        })
      } catch (err) {}
    }
    fetchData()
  }, [])

  if (!data) return <WidgetCard title="Weather" icon={Cloud}><div className="animate-pulse h-8 bg-white/10 rounded-lg w-full mt-auto"></div></WidgetCard>

  const aqiColor = data.aqi < 50 ? "text-green-400" : data.aqi < 100 ? "text-yellow-400" : data.aqi < 150 ? "text-orange-400" : "text-red-400"
  
  // Dynamic color based on time of day (day/night)
  const bgTheme = data.isDay ? "bg-gradient-to-br from-blue-400/20 to-orange-400/20" : "bg-gradient-to-br from-indigo-900/40 to-blue-900/40"
  const themeColor = data.isDay ? "orange" : "blue"

  return (
    <>
      <motion.div 
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-[20px] ${bgTheme} backdrop-blur-xl border border-white/10 shadow-xl p-4 flex flex-col justify-between h-[140px] w-full snap-center cursor-pointer hover:bg-white/10 transition-all`}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center justify-between mb-2 z-10">
          <div className="flex items-center gap-1.5">
            <div className={`p-1.5 rounded-full bg-${themeColor}-500/20 text-${themeColor}-400`}>
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-white/[0.85] tracking-wider uppercase">{data.city}</span>
          </div>
        </div>

        <div className="z-10 flex-1 flex flex-col justify-end">
          <div className="flex items-end justify-between mt-1">
            <div className="flex flex-col">
              <div className="flex items-start">
                <div className="text-[28px] font-black text-white leading-none tracking-tight">{data.temperature}°</div>
                <div className="text-white/70 text-xs font-bold ml-1 mt-1">H:{data.maxTemp}° L:{data.minTemp}°</div>
              </div>
              <div className="text-white/70 font-semibold text-[11px] uppercase tracking-wider mt-1.5">{data.condition}</div>
            </div>
            <div className="text-4xl drop-shadow-xl mb-1">{data.icon}</div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Weather in ${data.city}`} icon={Cloud} color={themeColor}>
          <div className="flex flex-col items-center justify-center py-4">
            <span className="text-[100px] mb-2 drop-shadow-2xl leading-none">{data.icon}</span>
            <div className="flex items-start">
              <span className="text-6xl font-black text-white">{data.temperature}°C</span>
            </div>
            <span className="text-xl text-white/[0.85] font-semibold mt-2">{data.condition}</span>
            <span className="text-sm text-white/60 font-medium mt-1">Feels like {data.feelsLike}°C</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center border border-white/10">
              <span className="text-white/[0.85] text-[10px] uppercase mb-0.5 font-bold text-center tracking-wider">Air Quality</span>
              <span className={`text-xl font-black ${aqiColor}`}>{data.aqi}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center border border-white/10">
              <span className="text-white/[0.85] text-[10px] uppercase mb-0.5 font-bold text-center tracking-wider">Humidity</span>
              <span className="text-xl font-black text-blue-300">{data.humidity}%</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center border border-white/10">
              <span className="text-white/[0.85] text-[10px] uppercase mb-0.5 font-bold text-center tracking-wider">Wind</span>
              <span className="text-xl font-black text-white">{data.windSpeed} <span className="text-xs">km/h</span></span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl flex flex-col items-center border border-white/10">
              <span className="text-white/[0.85] text-[10px] uppercase mb-0.5 font-bold text-center tracking-wider">High / Low</span>
              <span className="text-lg font-black text-white">{data.maxTemp}° / {data.minTemp}°</span>
            </div>
          </div>
        </DetailModal>
      </AnimatePresence>
    </>
  )
}

export function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <WidgetCard title="Clock" icon={Clock} color="blue" onClick={() => setIsOpen(true)}>
        <div>
          <div className="text-2xl font-black text-white tracking-tight">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-white/[0.85] font-medium text-xs mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </WidgetCard>
      
      <AnimatePresence>
        <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="World Clock" icon={Clock} color="blue">
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-white/[0.85] text-sm">Local Time</div>
                <div className="text-2xl font-bold text-white">{time.toLocaleTimeString()}</div>
              </div>
              <div className="text-right">
                <div className="text-white/[0.85] text-sm">Date</div>
                <div className="text-lg font-semibold text-white">{time.toLocaleDateString()}</div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-white/[0.85] text-sm">New York (EST)</div>
                <div className="text-xl font-bold text-white">
                  {new Date(time.getTime() - 1000 * 60 * 60 * 9.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-white/[0.85] text-sm">London (GMT)</div>
                <div className="text-xl font-bold text-white">
                  {new Date(time.getTime() - 1000 * 60 * 60 * 4.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </DetailModal>
      </AnimatePresence>
    </>
  )
}

export function CryptoWidget() {
  const [data, setData] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const btcValue = useOscillatingNumber(data?.bitcoin?.usd || 65000, 10, 3000)

  useEffect(() => {
    async function fetchData() {
      const prices = await getCryptoPrices()
      setData(prices)
    }
    fetchData()
  }, [])

  if (!data) return <WidgetCard title="Crypto" icon={Zap}><div className="animate-pulse h-8 bg-white/10 rounded-lg w-full mt-auto"></div></WidgetCard>

  const isUp = data.bitcoin.usd_24h_change >= 0

  return (
    <>
      <WidgetCard title="Bitcoin" icon={Zap} isLive color="yellow" onClick={() => setIsOpen(true)}>
        <div className="text-2xl font-black text-white tracking-tight">
          ${btcValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 text-xs font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(data.bitcoin.usd_24h_change).toFixed(2)}%
        </div>
      </WidgetCard>
      
      <AnimatePresence>
        <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Bitcoin (BTC)" icon={Zap} color="yellow">
           <div className="bg-white/5 rounded-2xl p-6 mb-4">
             <div className="text-white/[0.85] text-sm mb-2">Live Price (USD)</div>
             <div className="text-5xl font-black text-white mb-4">
               ${btcValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
             <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
               {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
               <span className="font-bold">{data.bitcoin.usd_24h_change.toFixed(2)}% (24h)</span>
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-4 rounded-xl">
               <div className="text-white/[0.85] text-xs uppercase mb-1">Market Cap</div>
               <div className="text-lg font-bold text-white">$1.2T</div>
             </div>
             <div className="bg-white/5 p-4 rounded-xl">
               <div className="text-white/[0.85] text-xs uppercase mb-1">24h Volume</div>
               <div className="text-lg font-bold text-white">$34.5B</div>
             </div>
           </div>
        </DetailModal>
      </AnimatePresence>
    </>
  )
}
export function SunriseWidget() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <WidgetCard title="Sun" icon={Sunrise} color="yellow" onClick={() => setIsOpen(true)}>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-white/[0.85] text-[10px] uppercase font-bold mb-0.5">Sunrise</div>
            <div className="text-xl font-black text-white">05:42 AM</div>
          </div>
          <div className="text-right">
            <div className="text-white/[0.85] text-[10px] uppercase font-bold mb-0.5">Sunset</div>
            <div className="text-xl font-black text-white">06:58 PM</div>
          </div>
        </div>
      </WidgetCard>
      
      <AnimatePresence>
        <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Solar Tracking" icon={Sun} color="yellow">
           <div className="py-8 flex flex-col items-center">
              <div className="relative w-64 h-32 overflow-hidden mb-4">
                <div className="absolute bottom-0 left-0 w-full h-full border-t-2 border-dashed border-yellow-500/30 rounded-t-full" />
                <div className="absolute bottom-[-10px] left-1/2 w-5 h-5 bg-yellow-400 rounded-full shadow-[0_0_20px_#facc15]" style={{ transform: 'rotate(45deg) translateX(-100px)' }} />
              </div>
              <div className="flex justify-between w-full px-4 text-sm font-bold text-white/[0.85]">
                <span>05:42 AM</span>
                <span>06:58 PM</span>
              </div>
              <div className="mt-8 text-center">
                <span className="text-4xl font-black text-white">13h 16m</span>
                <div className="text-white/[0.85] mt-1">Total Daylight Today</div>
              </div>
           </div>
        </DetailModal>
      </AnimatePresence>
    </>
  )
}

export function DemoDetailWidget({ title, icon, color, apiTarget, apiType, tvSymbol, baseValue, prefix = "", suffix = "", variance = 1, isUpInitial = true }: any) {
  const oscVal = useOscillatingNumber(baseValue, variance, 2000)
  const [data, setData] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchRealData() {
      if (!apiTarget || !apiType) return
      let res: any = null
      if (apiType === "market") res = await getMarketData(apiTarget)
      if (apiType === "metal") res = await getMetalPrice(apiTarget)
      if (apiType === "metal_india") {
        const loc = await getUserLocation()
        res = await getIndianMetalPrice(apiTarget as "gold" | "silver", loc.city)
      }
      if (apiType === "currency") res = await getCurrencyRate(apiTarget)
      if (apiType === "fuel") {
        const loc = await getUserLocation()
        res = await getFuelPrice(loc.city)
      }
      if (res) setData(res)
    }
    
    fetchRealData()
    const interval = setInterval(fetchRealData, 60000) // 1 minute updates
    return () => clearInterval(interval)
  }, [apiTarget, apiType])

  const val = data ? data.price : oscVal
  const isUp = data ? data.changePercent >= 0 : isUpInitial
  const changeStr = data ? Math.abs(data.changePercent).toFixed(2) : (Math.random() * 1.5).toFixed(2)

  return (
    <>
      <WidgetCard title={title} icon={icon} isLive color={color} onClick={() => setIsOpen(true)}>
        <div className="text-2xl font-black text-white tracking-tight">
          {prefix}{val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{suffix}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 text-xs font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {changeStr}%
        </div>
        <div className="mt-2 text-[10px] text-white/[0.85] uppercase font-bold tracking-wider">
          {data ? "Real-Time" : "Estimated"}
        </div>
      </WidgetCard>

      <AnimatePresence>
        <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`${title} Live Market`} icon={icon} color={color}>
          {tvSymbol ? (
            <div className="w-full h-[400px] bg-[#131722] rounded-xl overflow-hidden border border-white/10 relative">
              <iframe 
                src={`https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=1D&theme=dark&style=2&hide_top_toolbar=1&hide_legend=1&save_image=0`}
                className="w-full h-full border-0 absolute inset-0"
                allowTransparency
                scrolling="no"
                allowFullScreen
              />
            </div>
          ) : (
            <>
              <div className="bg-white/5 rounded-2xl p-6 mb-4">
                <div className="text-white/[0.85] text-sm mb-2">{data ? "Real-Time Live Price" : "Estimated Market Average"}</div>
                <div className="text-5xl font-black text-white mb-4">
                   {prefix}{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                   {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                   <span className="font-bold">{isUp ? "+" : ""}{changeStr}% Today</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-white/[0.85] text-xs uppercase mb-1">Today's High</div>
                  <div className="text-lg font-bold text-white">{prefix}{data ? (val * 1.005).toLocaleString(undefined, { maximumFractionDigits: 2 }) : (baseValue + variance * 4).toLocaleString()}{suffix}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-white/[0.85] text-xs uppercase mb-1">Today's Low</div>
                  <div className="text-lg font-bold text-white">{prefix}{data ? (val * 0.995).toLocaleString(undefined, { maximumFractionDigits: 2 }) : (baseValue - variance * 4).toLocaleString()}{suffix}</div>
                </div>
              </div>
            </>
          )}
          
            <div className={`mt-4 p-4 rounded-xl flex gap-3 text-sm ${data || tvSymbol ? 'bg-green-500/10 border border-green-500/20 text-green-200' : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'}`}>
              <Info className="w-5 h-5 shrink-0" />
              <div>
                {tvSymbol 
                  ? "Interactive live market charts powered by Fact Flow™ Financial Network."
                  : data 
                    ? "Real-time updates provided by Fact Flow™ Intelligence Servers." 
                    : "Local market intel powered by Fact Flow™ Data Algorithms."}
              </div>
            </div>
        </DetailModal>
      </AnimatePresence>
    </>
  )
}

const TEAM_INFO: Record<string, { code: string, flag: string }> = {
  'india': { code: 'IND', flag: '🇮🇳' },
  'australia': { code: 'AUS', flag: '🇦🇺' },
  'england': { code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'pakistan': { code: 'PAK', flag: '🇵🇰' },
  'sri lanka': { code: 'SL', flag: '🇱🇰' },
  'new zealand': { code: 'NZ', flag: '🇳🇿' },
  'south africa': { code: 'SA', flag: '🇿🇦' },
  'west indies': { code: 'WI', flag: '🌴' },
  'bangladesh': { code: 'BAN', flag: '🇧🇩' },
  'afghanistan': { code: 'AFG', flag: '🇦🇫' },
  'ireland': { code: 'IRE', flag: '🇮🇪' },
  'zimbabwe': { code: 'ZIM', flag: '🇿🇼' }
}

function getTeamDetails(name: string) {
  const lowerName = name.toLowerCase();
  for (const [key, info] of Object.entries(TEAM_INFO)) {
    if (lowerName.includes(key)) {
      return { ...info, cleanName: name };
    }
  }
  // Fallback
  const code = name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  return { code, flag: '🏏', cleanName: name };
}

export function LiveCricketWidget({ title, icon: Icon, color }: any) {
  const [data, setData] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    let mounted = true
    const fetchIt = async () => {
      try {
        const res = await getCricketScore()
        if (mounted && res && res.team1) {
          setData(res)
        } else if (mounted && res && !res.team1) {
          setData({ team1: { name: "India", score: "-" }, team2: { name: "Australia", score: "-" }, status: "Upcoming Match", allMatches: [] })
        }
      } catch (err) {}
    }
    fetchIt()
    const interval = setInterval(fetchIt, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  return (
    <>
      <motion.div 
        onClick={() => setIsOpen(true)}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-[140px] w-full snap-center bg-white/5 backdrop-blur-md rounded-[20px] p-4 border border-white/10 flex flex-col justify-between overflow-hidden relative group cursor-pointer hover:bg-white/10 transition-colors"
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all duration-700`} />
        
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-${color}-500/20 text-${color}-400`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-white/[0.85]">{title}</span>
          </div>
          {data?.status === 'Live' && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-pulse border border-red-500/30">
              LIVE
            </span>
          )}
        </div>

        <div className="relative z-10 flex flex-col mt-2 h-full justify-end">
          {data ? (
            <>
              <div className="flex flex-col gap-1">
                {[data.team1, data.team2].map((team, idx) => {
                  const details = getTeamDetails(team.name);
                  const isBatting = data.status === 'Live' && team.score !== '-' && team.score !== 'Yet to bat' && data.match?.includes('*') && data.match?.split(' v ')[idx]?.includes('*');
                  
                  return (
                    <div key={idx} className="flex justify-between items-center bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-2.5">
                          <span className="text-lg leading-none">{details.flag}</span>
                          <div className="flex flex-col">
                             <span className="text-white font-bold text-sm truncate max-w-[90px] sm:max-w-[110px] tracking-tight leading-none">{details.code}</span>
                             <span className="text-white/50 text-[9px] uppercase font-bold mt-0.5 leading-none">{details.cleanName.substring(0, 15)}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-1.5">
                          {isBatting && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                          <span className="text-white font-black text-sm tracking-tight">{team.score}</span>
                       </div>
                    </div>
                  )
                })}
              </div>
              <div className={`flex items-center justify-center gap-1 text-[10px] font-bold mt-1.5 py-1 rounded-md border ${data.matchResult ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500/90' : 'bg-black/20 border-white/5 text-white/60'}`}>
                {data.matchResult ? <Trophy className="w-3 h-3 text-yellow-500 shrink-0" /> : <Info className="w-3 h-3 text-blue-400 shrink-0" />}
                <span className="truncate px-0.5">{data.matchResult ? data.matchResult : (data.status === 'Live' ? 'Match Ongoing' : data.status)}</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1 opacity-50 animate-pulse mt-auto">
               <div className="h-[36px] bg-white/10 rounded-lg w-full"></div>
               <div className="h-[36px] bg-white/10 rounded-lg w-full"></div>
               <div className="h-5 bg-white/10 rounded-md w-full mt-0.5"></div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Cricket Center" icon={Trophy} color={color}>
           <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {data?.allMatches?.length > 0 ? (
                data.allMatches.map((m: any, idx: number) => {
                  const t1 = getTeamDetails(m.team1.name);
                  const t2 = getTeamDetails(m.team2.name);
                  const isLive = m.status === 'Live';
                  const isComplete = m.status === 'Match Complete';

                  return (
                    <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-3 relative overflow-hidden">
                      {isLive && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent"></div>}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none truncate max-w-[60%]">
                          {m.match.replace(/\*|-(.*?)$/g, '').trim()}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isLive ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : isComplete ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                          {m.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-black/40 px-3 py-2.5 rounded-xl">
                           <div className="flex items-center gap-3">
                              <span className="text-xl leading-none">{t1.flag}</span>
                              <span className="font-bold text-white text-sm">{t1.cleanName}</span>
                           </div>
                           <span className={`font-black text-base ${isLive ? 'text-white' : 'text-white/[0.85]'}`}>{m.team1.score}</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 px-3 py-2.5 rounded-xl">
                           <div className="flex items-center gap-3">
                              <span className="text-xl leading-none">{t2.flag}</span>
                              <span className="font-bold text-white text-sm">{t2.cleanName}</span>
                           </div>
                           <span className={`font-black text-base ${isLive ? 'text-white' : 'text-white/[0.85]'}`}>{m.team2.score}</span>
                        </div>
                      </div>

                      {m.matchResult && (
                        <div className="text-xs text-yellow-400 font-bold bg-yellow-500/10 px-3 py-2 rounded-xl border border-yellow-500/20 flex items-center justify-center gap-2 text-center leading-tight mt-1">
                           <Trophy className="w-4 h-4 shrink-0" />
                           {m.matchResult}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-white/50 py-8">No match data available at the moment.</div>
              )}
           </div>
        </DetailModal>
      </AnimatePresence>
    </>
  )
}
