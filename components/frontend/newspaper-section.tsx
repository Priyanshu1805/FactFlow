"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"

export function NewspaperSection() {
  const { settings } = useSettings()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }

  const [newspaperNews, setNewspaperNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?longform=true&limit=6`)
        .then((res) => res.json())
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
  const secondary = newspaperNews.slice(1, 3);
  const others = newspaperNews.slice(3, 6);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  return (
    <section id="newspaper" className="relative py-20 px-4 newspaper-parchment newspaper-texture overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* ═══ ORNAMENTAL TOP BORDER ═══ */}
        <div className="newspaper-ornament mb-4">✦ ✦ ✦</div>

        {/* ═══ MASTHEAD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-2"
        >
          <p className="font-newspaper-body text-xs tracking-[0.4em] uppercase text-[#5a4f3a] mb-3">
            ✦ Established MMXXVI ✦
          </p>

          <Link href="/newspaper">
            <h2 className="newspaper-masthead text-5xl md:text-7xl lg:text-8xl cursor-pointer hover:opacity-80 transition-opacity">
              The Fact Flow Times
            </h2>
          </Link>

          <div className="mt-4 mb-2">
            <div className="newspaper-ornament text-[10px]">❧</div>
          </div>
        </motion.div>

        {/* ═══ DATE BAR ═══ */}
        <div className="flex justify-between items-center py-2 border-t-2 border-b border-[#1a1a1a] text-[10px] md:text-xs font-newspaper-body uppercase tracking-[0.2em] text-[#4a3f2f] mb-1">
          <span>Vol. I — No. 1</span>
          <span className="hidden sm:inline">{currentDate}</span>
          <Link href="/newspaper" className="hover:underline underline-offset-2 font-bold">
            Read Full Edition →
          </Link>
          <span>Price: Free</span>
        </div>

        {/* ═══ TRIPLE RULE DIVIDER ═══ */}
        <hr className="newspaper-triple-rule my-6" />

        {/* ═══ NEWSPAPER BODY ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* ─── MAIN STORY (Left/Center) ─── */}
          {featured && (
            <div className="lg:col-span-8 newspaper-column-rule pr-0 lg:pr-8 pb-8 lg:pb-0">
              <Link href={`/article/${featured.id}`} className="block group">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {/* Headline */}
                  <h1 className="font-newspaper-headline text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] mb-6 group-hover:underline decoration-2 underline-offset-4 text-[#1a1a1a]">
                    {featured.title}
                  </h1>

                  {/* Byline */}
                  <div className="newspaper-byline text-[#5a4f3a] mb-5">
                    By {featured.authorName} — <span className="not-italic">{featured.time}</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    {displayOptions.thumbnails !== false && (
                      <div className="w-full md:w-2/3">
                        <div className="relative w-full aspect-[4/3] newspaper-image-frame overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                          <Image src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={featured.title} fill className="object-cover" />
                        </div>
                        <p className="font-newspaper-body text-[10px] italic text-[#6b5e47] mt-2 text-center tracking-wide">
                          — Photograph courtesy of The Fact Flow Archives —
                        </p>
                      </div>
                    )}

                    {/* Excerpt with Drop Cap */}
                    <div className={`w-full ${displayOptions.thumbnails === false ? 'md:w-full' : 'md:w-1/3'} flex flex-col justify-between`}>
                      <div>
                        <p className="font-newspaper-body text-base md:text-lg leading-relaxed newspaper-dropcap text-[#2a2520]">
                          {featured.excerpt}
                        </p>
                      </div>
                      <div className="mt-6 pt-3 border-t border-dashed border-[#4a3f2f]">
                        <span className="font-newspaper-body text-sm italic tracking-wide text-[#5a4f3a] group-hover:text-[#1a1a1a] transition-colors">
                          Continued on Page 1 →
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            </div>
          )}

          {/* ─── SECONDARY STORIES (Right Column) ─── */}
          <div className="lg:col-span-4 pl-0 lg:pl-8 flex flex-col">
            {secondary.map((article, idx) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group">
                <motion.article
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`pb-6 mb-6 ${idx < secondary.length - 1 ? 'border-b border-[#1a1a1a]' : ''}`}
                >
                  <h3 className="font-newspaper-headline text-xl md:text-2xl font-bold leading-tight mb-3 group-hover:underline underline-offset-2 text-[#1a1a1a]">
                    {article.title}
                  </h3>

                  {displayOptions.thumbnails !== false && (
                    <div className="relative w-full h-36 newspaper-image-frame overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 mb-3">
                      <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"} alt={article.title} fill className="object-cover" />
                    </div>
                  )}

                  <div className="newspaper-byline text-[#5a4f3a] mb-2">
                    By {article.authorName} — {article.time}
                  </div>

                  <p className="font-newspaper-body text-sm leading-relaxed line-clamp-3 text-[#2a2520]">
                    {article.excerpt}
                  </p>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ ORNAMENTAL DIVIDER ═══ */}
        <div className="newspaper-ornament my-8">§</div>

        {/* ═══ BOTTOM STRIP — LATEST DISPATCHES ═══ */}
        {others.length > 0 && (
          <>
            <div className="text-center mb-6">
              <span className="newspaper-label text-[#4a3f2f] inline-block px-6">
                Late Dispatches & Press Bulletins
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {others.map((article, idx) => (
                <Link href={`/article/${article.id}`} key={article.id} className="block group">
                  <motion.article
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className={`px-5 py-4 ${idx < others.length - 1 ? 'md:border-r border-[#1a1a1a]' : ''} ${idx < others.length - 1 ? 'border-b md:border-b-0 border-[#1a1a1a]' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-newspaper-body uppercase tracking-[0.2em] text-[#6b5e47]">
                      <span className="text-[#8b7d5e]">✦</span>
                      <span>Press Dispatch</span>
                      <span className="text-[#8b7d5e]">✦</span>
                    </div>

                    <h4 className="font-newspaper-headline text-lg font-bold leading-snug mb-2 group-hover:underline underline-offset-2 text-[#1a1a1a]">
                      {article.title}
                    </h4>

                    <p className="font-newspaper-body text-sm leading-relaxed line-clamp-2 text-[#3d362a]">
                      {article.excerpt}
                    </p>

                    <div className="newspaper-byline text-[#6b5e47] mt-2 text-[10px]">
                      By Correspondent — {article.time}
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ═══ ORNAMENTAL BOTTOM BORDER ═══ */}
        <div className="newspaper-ornament mt-8">✦ ✦ ✦</div>

      </div>
    </section>
  )
}
