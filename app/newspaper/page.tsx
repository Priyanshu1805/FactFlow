"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { Navbar } from "@/components/frontend/navbar"
import { Footer } from "@/components/frontend/footer"

export default function NewspaperPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?longform=true&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setNews(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  const featured = news[0]
  const topStories = news.slice(1, 4)
  const restStories = news.slice(4)

  return (
    <div className="min-h-screen newspaper-parchment">
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4 max-w-6xl mx-auto min-h-screen newspaper-texture">
        <div className="relative z-10">

          {/* ═══ BACK BUTTON ═══ */}
          <Link href="/" className="inline-flex mb-8 items-center gap-2 font-newspaper-body text-sm italic tracking-wide transition-colors text-[#5a4f3a] hover:text-[#1a1a1a]">
            <ArrowLeft className="w-4 h-4" /> Return to Front Page
          </Link>

          {/* ═══ ORNAMENTAL TOP ═══ */}
          <div className="newspaper-ornament mb-4">✦ ✦ ✦</div>

          {/* ═══ MASTHEAD ═══ */}
          <div className="text-center mb-2">
            <p className="font-newspaper-body text-xs tracking-[0.4em] uppercase mb-3 text-[#5a4f3a]">
              ✦ Established MMXXVI ✦
            </p>

            <h1 className="newspaper-masthead text-6xl md:text-8xl lg:text-[7rem]">
              The Fact Flow Times
            </h1>

            <div className="mt-4 mb-2">
              <div className="newspaper-ornament text-[10px]">❧</div>
            </div>
          </div>

          {/* ═══ DATE BAR ═══ */}
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-t-2 border-b text-[10px] md:text-xs font-newspaper-body uppercase tracking-[0.2em] border-[#1a1a1a] text-[#4a3f2f]">
            <span>Global Edition</span>
            <span>{currentDate}</span>
            <span>Unbiased & In-Depth</span>
          </div>

          {/* ═══ TRIPLE RULE ═══ */}
          <hr className="my-6 newspaper-triple-rule" />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ═══ FEATURED LEAD STORY ═══ */}
              {featured && (
                <Link href={`/article/${featured._id}`} className="block group mb-10">
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-10 border-b-2 border-[#1a1a1a]"
                  >
                    <h2 className="font-newspaper-headline text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-5 group-hover:underline decoration-2 underline-offset-4 text-[#1a1a1a]">
                      {featured.title}
                    </h2>

                    <div className="newspaper-byline mb-5 text-[#5a4f3a]">
                      By {featured.author?.name || "Fact Flow Desk"} — {new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-1/2">
                        <div className="relative aspect-[4/3] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 newspaper-image-frame">
                          <Image src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"} alt={featured.title} fill className="object-cover" />
                        </div>
                        <p className="font-newspaper-body text-[10px] italic text-center tracking-wide mt-2 text-[#6b5e47]">
                          — Photograph courtesy of The Fact Flow Archives —
                        </p>
                      </div>
                      <div className="w-full md:w-1/2">
                        <p className="font-newspaper-body text-lg leading-relaxed newspaper-dropcap text-[#2a2520]">
                          {featured.excerpt}
                        </p>
                        <div className="mt-6 pt-3 border-t border-dashed border-[#4a3f2f]">
                          <span className="font-newspaper-body text-sm italic tracking-wide group-hover:underline text-[#5a4f3a]">
                            Full story continues below →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              )}

              {/* ═══ TOP STORIES ROW ═══ */}
              {topStories.length > 0 && (
                <>
                  <div className="text-center my-8">
                    <span className="newspaper-label inline-block px-6 text-[#4a3f2f]">
                      Top Stories of the Day
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-10">
                    {topStories.map((article, idx) => {
                      const readTime = Math.max(3, Math.ceil((article.content?.length || 1000) / 1000)) + " min read";
                      return (
                        <Link href={`/article/${article._id}`} key={article._id || idx} className="block group">
                          <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={`px-5 py-4 ${idx < topStories.length - 1 ? 'md:border-r border-[#1a1a1a]' : ''} ${idx < topStories.length - 1 ? 'border-b md:border-b-0 border-[#1a1a1a]' : ''}`}
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mb-4 newspaper-image-frame">
                              <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"} alt={article.title} fill className="object-cover" />
                            </div>

                            <h3 className="font-newspaper-headline text-xl font-bold leading-tight mb-3 group-hover:underline underline-offset-2 text-[#1a1a1a]">
                              {article.title}
                            </h3>

                            <div className="newspaper-byline mb-2 text-[#5a4f3a]">
                              By {article.author?.name || "Fact Flow Desk"} — {readTime}
                            </div>

                            <p className="font-newspaper-body text-sm leading-relaxed line-clamp-4 text-[#2a2520]">
                              {article.excerpt}
                            </p>
                          </motion.article>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ═══ ORNAMENTAL DIVIDER ═══ */}
              <div className="newspaper-ornament my-8">§</div>

              {/* ═══ REMAINING STORIES — COLUMN LAYOUT ═══ */}
              {restStories.length > 0 && (
                <>
                  <div className="text-center mb-8">
                    <span className="newspaper-label inline-block px-6 text-[#4a3f2f]">
                      Further Reports & Correspondence
                    </span>
                  </div>

                  <div className="columns-1 md:columns-2 lg:columns-3 gap-8" style={{ columnRule: '1px solid #1a1a1a' }}>
                    {restStories.map((article, idx) => {
                      const readTime = Math.max(3, Math.ceil((article.content?.length || 1000) / 1000)) + " min read";
                      return (
                        <Link href={`/article/${article._id}`} key={article._id || idx} className="block group break-inside-avoid">
                          <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                            className="pb-8 mb-8 border-b border-[#1a1a1a]"
                          >
                            <h3 className="font-newspaper-headline font-bold text-2xl leading-[1.1] mb-3 group-hover:underline underline-offset-4 text-[#1a1a1a]">
                              {article.title}
                            </h3>

                            <div className="relative aspect-[4/3] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mb-4 newspaper-image-frame">
                              <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"} alt={article.title} fill className="object-cover" />
                            </div>

                            <div className="newspaper-byline mb-3 text-[#6b5e47]">
                              By {article.author?.name || "Fact Flow Desk"} — {readTime}
                            </div>

                            <p className="font-newspaper-body text-base leading-relaxed line-clamp-5 text-[#2a2520]">
                              {article.excerpt}
                            </p>
                          </motion.article>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ═══ BOTTOM ORNAMENT ═══ */}
              <div className="newspaper-ornament mt-10">✦ ✦ ✦</div>

              <p className="text-center font-newspaper-body text-xs italic tracking-widest mt-4 text-[#6b5e47]">
                — End of Today's Edition —
              </p>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
