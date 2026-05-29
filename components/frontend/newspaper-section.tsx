"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"

export function NewspaperSection() {
  const { settings } = useSettings()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }

  const [newspaperNews, setNewspaperNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?longform=true&limit=16`)
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

  if (newspaperNews.length === 0 && !loading) return null;

  const featured = newspaperNews[0];
  const leftStories = newspaperNews.slice(1, 4);
  const rightStories = newspaperNews.slice(4, 8);
  const bottomStories = newspaperNews.slice(8, 16);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  return (
    <section id="newspaper" className="relative py-20 px-4 newspaper-parchment newspaper-texture overflow-hidden">
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

        {/* ═══ DESKTOP/TABLET FRONT PAGE (md and larger) ═══ */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0">
          
          {/* ─── LEFT COLUMN (Opinion/Secondary) ─── */}
          <div className="md:col-span-1 lg:col-span-3 border-r-0 lg:border-r lg:border-[#e5e5e5] pr-0 lg:pr-4 pb-6 lg:pb-0">
            {leftStories.map((article, idx) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group">
                <motion.article
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`pb-4 mb-4 ${idx < leftStories.length - 1 ? 'border-b border-[#111]' : ''}`}
                >
                  <h3 className="font-newspaper-headline text-xl sm:text-2xl md:text-3xl font-normal leading-tight mb-2 group-hover:underline text-[#111]">
                    {article.title}
                  </h3>
                  <div className="font-newspaper-body text-[10px] font-bold uppercase mb-2 text-[#111]">
                    {article.authorName}
                  </div>
                  <hr className="border-t border-[#111] mb-2" />
                  <p className="font-newspaper-body text-sm leading-snug text-justify line-clamp-4 sm:line-clamp-6 text-[#111]">
                    {article.excerpt}
                  </p>
                </motion.article>
              </Link>
            ))}
          </div>

          {/* ─── CENTER COLUMN (Main Story) ─── */}
          <div className="md:col-span-1 lg:col-span-6 border-r-0 lg:border-r lg:border-[#e5e5e5] px-4 md:px-4 lg:px-6 pb-6 lg:pb-0">
            {featured && (
              <Link href={`/article/${featured.id}`} className="block group">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-between items-end border-b border-[#111] pb-1 mb-2">
                    <span className="font-newspaper-body text-[10px] uppercase font-bold text-[#111]">Global Affairs</span>
                  </div>

                  <h1 className="font-newspaper-headline text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-normal leading-tight mb-4 group-hover:underline text-[#111]">
                    {featured.title}
                  </h1>

                  {displayOptions.thumbnails !== false && (
                    <div className="w-full mb-4">
                      <div className="relative w-full aspect-[16/9] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                        <Image src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={featured.title} fill className="object-cover" />
                      </div>
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
          <div className="md:col-span-2 lg:col-span-3 pl-0 lg:pl-4 flex flex-col">
            {rightStories.map((article, idx) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group">
                <motion.article
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`pb-4 mb-4 ${idx < rightStories.length - 1 ? 'border-b border-[#111]' : ''}`}
                >
                  <h3 className="font-newspaper-headline text-lg sm:text-xl lg:text-2xl font-normal leading-tight mb-2 group-hover:underline text-[#111]">
                    {article.title}
                  </h3>
                  <div className="font-newspaper-body text-[10px] leading-tight mb-2 text-[#111]">
                    <span className="uppercase font-bold">By {article.authorName}</span> <br/>
                    {article.time}
                  </div>
                  <p className="font-newspaper-body text-sm leading-snug text-justify line-clamp-3 sm:line-clamp-4 text-[#111]">
                    {article.excerpt}
                  </p>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ DESKTOP BOTTOM GRID ═══ */}
        {bottomStories.length > 0 && (
          <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-[#111] mt-6 pt-6">
            {bottomStories.map((article, idx) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group">
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={`px-4 py-4 ${idx % 4 !== 3 ? 'md:border-r border-[#e5e5e5]' : ''} ${idx >= bottomStories.length - 4 ? 'md:pb-0' : 'border-b md:border-b-0 border-[#e5e5e5] pb-4 mb-4'}`}
                >
                  {displayOptions.thumbnails !== false && (
                    <div className="relative w-full aspect-[3/2] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 mb-2">
                      <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={article.title} fill className="object-cover" />
                    </div>
                  )}
                  <h4 className="font-newspaper-headline text-base sm:text-lg font-normal leading-tight mb-2 group-hover:underline text-[#111]">
                    {article.title}
                  </h4>
                  <p className="font-newspaper-body text-xs leading-snug text-justify line-clamp-3 text-[#111]">
                    {article.excerpt}
                  </p>
                </motion.article>
              </Link>
            ))}
          </div>
        )}

        {/* ═══ MOBILE FRONT PAGE SEQUENCE (under md) ═══ */}
        <div className="md:hidden flex flex-col gap-0 text-[#111]">
          
          {/* Main Featured Story */}
          {featured && (
            <Link href={`/article/${featured.id}`} className="block group pb-6 mb-6 border-b-2 border-double border-[#111]">
              <article>
                <div className="text-center mb-3">
                  <span className="font-newspaper-body text-[10px] font-black uppercase tracking-widest text-red-800 border border-red-800/40 px-2.5 py-0.5 rounded">
                    LATE CITY BULLETINS
                  </span>
                </div>
                
                <h1 className="font-newspaper-headline text-3xl font-bold text-center leading-tight mb-4 text-[#111] group-hover:underline">
                  {featured.title}
                </h1>
                
                {displayOptions.thumbnails !== false && (
                  <div className="w-full mb-4 p-1.5 bg-white border border-[#ddd]">
                    <div className="relative w-full aspect-[16/10] overflow-hidden grayscale">
                      <Image src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={featured.title} fill className="object-cover" />
                    </div>
                    <div className="font-newspaper-body text-[9px] text-[#222] mt-1.5 text-center italic">
                      By {featured.authorName} — Dispatch for The Fact Flow Times
                    </div>
                  </div>
                )}
                
                <p className="font-newspaper-body text-sm leading-relaxed text-justify newspaper-dropcap text-[#111] px-1">
                  {featured.excerpt}
                </p>
                <p className="font-newspaper-body text-sm leading-relaxed text-justify text-[#222] px-1 mt-2.5">
                  The current events mark an important chapter, causing shifts in public opinion. Correspondents report high engagement, and updates will be filed as they materialize.
                </p>
              </article>
            </Link>
          )}

          {/* 2-Column Print Style Layout (6 stories) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {newspaperNews.slice(1, 7).map((article, idx) => {
              const isLeftCol = idx % 2 === 0;
              return (
                <Link 
                  href={`/article/${article.id}`} 
                  key={article.id} 
                  className={`block group relative ${
                    isLeftCol 
                      ? "pr-4 after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:w-[1px] after:bg-[#111]/15" 
                      : "pl-1"
                  } ${
                    idx < 4 ? "border-b border-dotted border-[#111]/20 pb-4" : ""
                  }`}
                >
                  <article className="h-full flex flex-col justify-between">
                    <div>
                      <div className="font-newspaper-body text-[8px] font-bold uppercase tracking-wider text-red-800 mb-1">
                        {article.tag || "Dispatch"}
                      </div>
                      <h3 className="font-newspaper-headline text-base font-bold leading-tight mb-2 text-[#111] group-hover:underline">
                        {article.title}
                      </h3>
                      <p className="font-newspaper-body text-[11px] leading-snug text-justify text-[#222] line-clamp-4">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="font-newspaper-body text-[8px] text-[#555] uppercase mt-2 pt-1 border-t border-dotted border-[#111]/10">
                      {article.time}
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {/* Late News Dispatch Index */}
          {newspaperNews.length > 7 && (
            <div className="border-t-4 border-double border-[#111] mt-6 pt-5">
              <div className="bg-[#111]/3 p-4 rounded-xl border border-[#111]/10">
                <h4 className="font-newspaper-headline text-sm font-black uppercase tracking-wider text-center mb-3 text-[#111]">
                  - LATE NEWS DISPATCH INDEX -
                </h4>
                <div className="space-y-2.5">
                  {newspaperNews.slice(7, 13).map((article, idx) => (
                    <Link href={`/article/${article.id}`} key={article.id} className="block group">
                      <div className="flex justify-between items-baseline font-newspaper-body text-xs text-[#111] group-hover:underline gap-2">
                        <span className="font-bold uppercase text-[9px] text-red-800 shrink-0">{article.tag || "BULLETIN"}</span>
                        <span className="truncate flex-1 font-serif text-justify leading-none">{article.title}</span>
                        <span className="shrink-0 font-newspaper-body text-[10px] text-right font-bold pl-2 border-l border-dashed border-[#111]/20">
                          P. {idx + 4}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  )
}
