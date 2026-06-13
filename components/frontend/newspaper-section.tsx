"use client"
import { useAuthStore } from "@/store/auth-store";


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"
import { useRegion } from "@/components/providers/region-provider"
import { Separator } from "@/components/ui/separator"
import { LiveNewsBanner } from "@/components/frontend/live-news-banner"

export function NewspaperSection() {
  const { settings } = useSettings()
  const { region } = useRegion()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }

  const [newspaperNews, setNewspaperNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?longform=true&limit=16&${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}&region=GLOBAL`)
        .then((res) => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .then((data) => {
          if (data.success && data.data) {
            const formatted = data.data.map((item: any) => ({
              id: item._id,
              title: item.title,
              excerpt: item.excerpt,
              image: item.image,
              authorName: item.author?.name || "FACT FLOW DESK",
              readingTime: Math.max(1, Math.ceil((item.excerpt?.length || 100) / 100)) + " min read",
              time: new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              isPremium: item.isPremium || false,
              tag: item.tags?.[0] || item.category || "Press Dispatch",
              country: item.location || "GLOBAL"
            }))
            setNewspaperNews(formatted)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    fetchNews()

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNews, 30000)
    return () => clearInterval(interval)
  }, [])

  const featured = newspaperNews.length > 0 ? newspaperNews[0] : null;
  const leftStories = newspaperNews.length > 1 ? newspaperNews.slice(1, 4) : [];
  const rightStories = newspaperNews.length > 4 ? newspaperNews.slice(4, 8) : [];
  const bottomStories = newspaperNews.length > 8 ? newspaperNews.slice(8, 120) : [];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  return (
    <section id="newspaper" className="relative py-20 px-4 newspaper-parchment newspaper-texture overflow-hidden">
      <LiveNewsBanner category="Newspaper" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* ═══ MASTHEAD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 mt-8"
        >
          <Link href="/newspaper">
            <h2 className="newspaper-masthead text-4xl sm:text-6xl md:text-7xl lg:text-9xl cursor-pointer hover:opacity-80 transition-opacity text-[#111]">
              The Fact Flow Times
            </h2>
          </Link>
        </motion.div>

        {/* ═══ DATE BAR ═══ */}
        <div className="flex flex-wrap justify-between items-center py-2 border-t border-b border-[#111] text-[11px] sm:text-[10px] md:text-xs font-newspaper-body uppercase tracking-wider text-[#111] mb-1 gap-1">
          <span>INT'L EDITION</span>
          <span>{currentDate}</span>
          <Link href="/newspaper" className="hover:underline font-bold text-[#111] whitespace-nowrap">
            Full Edition →
          </Link>
        </div>

        {/* ═══ TRIPLE RULE DIVIDER ═══ */}
        <hr className="newspaper-triple-rule mb-6 mt-1" />

        {newspaperNews.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-newspaper-headline text-3xl md:text-5xl text-[#111] opacity-70 mb-4">No Print Edition Available</h3>
            <p className="font-newspaper-body text-lg text-[#111] opacity-60 max-w-lg">
              The editors are currently gathering and writing long-form stories for the {region.name} edition. Please check back later for full coverage.
            </p>
          </div>
        ) : (
          <>
            {/* ═══ DESKTOP/TABLET FRONT PAGE (md and larger) ═══ */}
            <div className={`hidden md:grid gap-0 ${
          leftStories.length > 0 && rightStories.length > 0 ? 'lg:grid-cols-12 md:grid-cols-2' :
          leftStories.length > 0 ? 'lg:grid-cols-9 md:grid-cols-2 justify-center mx-auto' :
          rightStories.length > 0 ? 'lg:grid-cols-9 md:grid-cols-2 justify-center mx-auto' :
          'lg:grid-cols-6 md:grid-cols-1 justify-center mx-auto'
        }`} style={{ gridAutoRows: 'min-content' }}>
          
          {/* ─── LEFT COLUMN (Opinion/Secondary) ─── */}
          {leftStories.length > 0 && (
            <div className="md:col-span-1 lg:col-span-3 md:border-r md:border-[#e5e5e5] pr-0 md:pr-4">
            <div className="flex flex-col h-auto">
              {leftStories.map((article, idx) => (
                <Link href={`/article/${article.id}`} key={article.id} className="block group">
                  <motion.article
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex flex-col pb-4 mb-4 ${idx < leftStories.length - 1 ? 'border-b border-[#111]' : ''}`}
                  >
                    <h3 className="font-newspaper-headline text-xl sm:text-2xl md:text-3xl font-normal leading-tight mb-2 group-hover:underline text-[#111]">
                      {article.title}
                    </h3>
                    <div className="font-newspaper-body text-[10px] font-bold uppercase mb-2 text-[#111]">
                      {article.authorName}
                    </div>
                    <hr className="border-t border-[#111] mb-2" />
                    <p className="font-newspaper-body text-sm leading-snug text-justify line-clamp-5 text-[#111]">
                      {article.excerpt}
                    </p>
                  </motion.article>
                </Link>
              ))}
              </div>
            </div>
          )}
          {/* ─── CENTER COLUMN (Main Story) ─── */}
          <div className="md:col-span-1 lg:col-span-6 px-4 md:px-4 lg:px-6">
            {featured && (
              <Link href={`/article/${featured.id}`} className="block group">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col h-auto"
                >
                  <div className="flex justify-between items-end border-b border-[#111] pb-1 mb-2">
                    <span className="font-newspaper-body text-[10px] uppercase font-bold text-[#111]">Global Affairs</span>
                  </div>

                  <h1 className="font-newspaper-headline text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-normal leading-tight mb-4 group-hover:underline text-[#111]">
                    {featured.title}
                  </h1>

                  {displayOptions.thumbnails !== false && (
                    <div className="w-full mb-4 relative">
                      <div className="relative w-full aspect-[16/9] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                        <Image src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={featured.title} fill className="object-cover" />
                      </div>
                      
                      {/* Classy Stamp instead of massive watermark */}
                      {featured.country && featured.country !== "Global" && (
                        <div className="absolute top-2 right-2 border-2 border-[#111] bg-[#f4f1ea] px-2 py-1 transform rotate-[-5deg] shadow-sm">
                          <span className="text-[#111] font-newspaper-headline font-bold uppercase tracking-widest text-xs">
                            {featured.country.substring(0, 2)}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between mt-1 gap-1">
                        <div className="font-newspaper-body text-[9px] uppercase text-[#111]">By {featured.authorName}</div>
                        <p className="font-newspaper-body text-[9px] text-[#111] text-right">
                          Photograph by Fact Flow
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="w-full columns-1 md:columns-2 gap-6" style={{ columnRule: '1px solid #e5e5e5' }}>
                    <p className="font-newspaper-body text-sm leading-snug text-justify newspaper-dropcap text-[#111] mb-4">
                      {featured.excerpt}
                    </p>
                    <p className="font-newspaper-body text-sm leading-snug text-justify text-[#111]">
                       The unfolding events mark a significant turning point in the timeline, drawing attention from various factions. Observers have noted that the rapid escalation was largely unforeseen by analysts. Correspondents on the ground report a shifting atmosphere, with public sentiment swinging drastically. The editorial board continues to monitor the situation closely, promising further updates.
                    </p>
                  </div>
                </motion.article>
              </Link>
            )}
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          {rightStories.length > 0 && (
            <div className="md:col-span-2 lg:col-span-3 pl-0 lg:pl-4 md:border-l md:border-[#e5e5e5]">
              <div className="flex flex-col h-auto">
              {rightStories.map((article, idx) => (
                <Link href={`/article/${article.id}`} key={article.id} className="block group">
                  <motion.article
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex flex-col pb-4 mb-4 ${idx < rightStories.length - 1 ? 'border-b border-[#111]' : ''}`}
                  >
                    <h3 className="font-newspaper-headline text-lg sm:text-xl lg:text-2xl font-normal leading-tight mb-2 group-hover:underline text-[#111]">
                      {article.title}
                    </h3>
                    <div className="font-newspaper-body text-[10px] leading-tight mb-2 text-[#111]">
                      <span className="uppercase font-bold">By {article.authorName}</span> <br/>
                      {article.time}
                    </div>
                    <p className="font-newspaper-body text-sm leading-snug text-justify line-clamp-4 text-[#111]">
                      {article.excerpt}
                    </p>
                  </motion.article>
                </Link>
              ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ DESKTOP BOTTOM GRID ═══ */}
        {bottomStories.length > 0 && (
          <div className="hidden md:grid md:grid-cols-4 gap-0 border-t border-[#111] mt-6 pt-6" style={{ gridAutoRows: 'min-content' }}>
            {bottomStories.map((article, idx) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group">
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={`flex flex-col justify-between h-full px-4 py-4 ${idx % 4 !== 3 ? 'md:border-r border-[#e5e5e5]' : ''} ${idx >= 4 ? 'border-t border-[#e5e5e5]' : ''}`}
                >
                  {displayOptions.thumbnails !== false && (
                    <div className="relative w-full aspect-[3/2] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 mb-2">
                      <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={article.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-newspaper-headline text-base sm:text-lg font-normal leading-tight mb-2 group-hover:underline text-[#111]">
                      {article.title}
                    </h4>
                    <p className="font-newspaper-body text-xs leading-snug text-justify line-clamp-3 text-[#111]">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="font-newspaper-body text-[9px] text-[#555] uppercase mt-2 pt-1.5 border-t border-dotted border-[#111]/15">
                    {article.authorName} · {article.time}
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        )}

        {/* ═══ MOBILE FRONT PAGE SEQUENCE (under md) - SMART WIDGET DESIGN ═══ */}
        <div className="md:hidden flex flex-col gap-5 px-1 py-2 font-sans">
          
          {/* Main Featured Story - Hero Widget */}
          {featured && (
            <Link href={`/article/${featured.id}`} className="block group">
              <article className="flex flex-col bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative active:scale-[0.98] transition-transform duration-200">
                
                {displayOptions.thumbnails !== false && (
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image 
                      src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} 
                      alt={featured.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm">
                      Top Story
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {featured.tag || "Breaking"}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl font-bold leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                    {featured.title}
                  </h1>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mt-1 leading-relaxed">
                    {featured.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden relative">
                        <Image src={`https://api.dicebear.com/7.x/initials/svg?seed=${featured.authorName}&backgroundColor=111`} alt="Author" fill />
                      </div>
                      {featured.authorName}
                    </span>
                    <span>{featured.time}</span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Smart List Widget (Next 6 stories) */}
          <div className="flex flex-col gap-4 mt-2">
            {newspaperNews.slice(1, 7).map((article, idx) => (
              <Link 
                href={`/article/${article.id}`} 
                key={article.id} 
                className="block group"
              >
                <article className="flex items-stretch gap-4 bg-white p-3 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] border border-gray-100 active:bg-gray-50 transition-colors">
                  <div className="flex-1 flex flex-col justify-center py-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1.5">
                      {article.tag || "Latest"}
                    </div>
                    <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-3 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <div className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {article.time}
                    </div>
                  </div>
                  
                  {displayOptions.thumbnails !== false && (
                    <div className="relative w-[100px] h-[100px] shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image 
                        src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} 
                        alt={article.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>

          {/* Late News Dispatch Index - Clean Accordion-like List */}
          {newspaperNews.length > 7 && (
            <div className="mt-4 bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  More Top Stories
                </h4>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {newspaperNews.slice(7, 120).map((article, idx) => (
                  <Link href={`/article/${article.id}`} key={article.id} className="block group px-5 py-4 active:bg-gray-50 transition-colors">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold uppercase text-[10px] tracking-wider text-red-600">{article.tag || "Update"}</span>
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {article.time} • By {article.authorName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        </>
      )}

      </div>
    </section>
  )
}
