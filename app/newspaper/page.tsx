"use client"
import { useAuthStore } from "@/store/auth-store";


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
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?longform=true&limit=50&${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
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
  const topStories = news.slice(1, 5)
  const restStories = news.slice(5)

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
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-t-2 border-b-2 text-[10px] md:text-xs font-newspaper-body uppercase tracking-[0.2em] border-[#1a1a1a] text-[#1a1a1a]">
            <span>Global Edition</span>
            <span>{currentDate}</span>
            <span>Unbiased & In-Depth</span>
          </div>

          {/* ═══ TRIPLE RULE ═══ */}
          <hr className="my-4 newspaper-triple-rule" />

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
                    <h2 className="font-newspaper-headline text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-4 group-hover:underline decoration-2 underline-offset-4 text-[#1a1a1a]">
                      {featured.title}
                    </h2>

                    <div className="newspaper-byline mb-6 text-[#1a1a1a]">
                      By {featured.author?.name || "Fact Flow Desk"} — {new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>

                    <div className="w-full mb-6 border-b-4 border-[#1a1a1a] pb-4">
                      <div className="relative aspect-[21/9] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 newspaper-image-frame">
                        <Image src={featured.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"} alt={featured.title} fill className="object-cover" />
                      </div>
                      <p className="font-newspaper-body text-[10px] italic text-right tracking-wide mt-2 text-[#1a1a1a] font-bold">
                        — Photograph courtesy of The Fact Flow Archives —
                      </p>
                    </div>
                    <div className="w-full columns-1 md:columns-2 lg:columns-3 gap-8" style={{ columnRule: '1px solid #1a1a1a' }}>
                      <p className="font-newspaper-body text-lg leading-tight text-justify newspaper-dropcap text-[#111111] mb-4">
                        {featured.excerpt}
                      </p>
                      <p className="font-newspaper-body text-lg leading-tight text-justify text-[#111111] mb-4">
                        The unfolding events mark a significant turning point in the timeline, drawing attention from various factions. Observers have noted that the rapid escalation was largely unforeseen by analysts.
                      </p>
                      <p className="font-newspaper-body text-lg leading-tight text-justify text-[#111111]">
                        Correspondents on the ground report a shifting atmosphere, with public sentiment swinging drastically. The editorial board continues to monitor the situation closely, promising further updates in the evening dispatch.
                      </p>
                    </div>
                    <div className="mt-6 pt-2 border-t-2 border-dashed border-[#1a1a1a] text-center">
                      <span className="font-newspaper-body text-sm italic tracking-wide group-hover:underline text-[#1a1a1a] uppercase font-bold">
                        Continues on Page A4 →
                      </span>
                    </div>
                  </motion.article>
                </Link>
              )}

              {/* ═══ TOP STORIES ROW ═══ */}
              {topStories.length > 0 && (
                <>
                  <div className="text-center my-6">
                    <span className="newspaper-label inline-block px-6 text-[#1a1a1a]">
                      Top Stories of the Day
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-8 border-t-4 border-b-4 border-[#1a1a1a] py-4">
                    {topStories.map((article, idx) => {
                      const readTime = Math.max(3, Math.ceil((article.content?.length || 1000) / 1000)) + " min read";
                      return (
                        <Link href={`/article/${article._id}`} key={article._id || idx} className="block group">
                          <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={`px-4 ${idx < topStories.length - 1 ? 'md:border-r-2 border-[#1a1a1a]' : ''} ${idx < topStories.length - 1 ? 'border-b-2 md:border-b-0 border-[#1a1a1a] pb-4 mb-4 md:pb-0 md:mb-0' : ''}`}
                          >
                            <h3 className="font-newspaper-headline text-xl font-bold leading-tight mb-2 group-hover:underline underline-offset-2 text-[#1a1a1a]">
                              {article.title}
                            </h3>
                            <div className="relative aspect-[4/3] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mb-3 newspaper-image-frame">
                              <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"} alt={article.title} fill className="object-cover" />
                            </div>

                            <div className="newspaper-byline mb-2 text-[#1a1a1a]">
                              By {article.author?.name || "Fact Flow Desk"} — {readTime}
                            </div>

                            <p className="font-newspaper-body text-sm leading-tight text-justify line-clamp-4 text-[#111111]">
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
              <div className="newspaper-ornament my-6">§</div>

              {/* ═══ REMAINING STORIES — COLUMN LAYOUT ═══ */}
              {restStories.length > 0 && (
                <>
                  <div className="text-center mb-6">
                    <span className="newspaper-label inline-block px-6 text-[#1a1a1a]">
                      Further Reports & Correspondence
                    </span>
                  </div>

                  <div className="columns-1 md:columns-2 lg:columns-4 gap-6" style={{ columnRule: '2px solid #1a1a1a' }}>
                    {restStories.map((article, idx) => {
                      const readTime = Math.max(3, Math.ceil((article.content?.length || 1000) / 1000)) + " min read";
                      return (
                        <Link href={`/article/${article._id}`} key={article._id || idx} className="block group break-inside-avoid">
                          <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                            className="pb-6 mb-6 border-b-2 border-[#1a1a1a]"
                          >
                            <h3 className="font-newspaper-headline font-bold text-2xl leading-[1.0] mb-2 group-hover:underline underline-offset-4 text-[#1a1a1a]">
                              {article.title}
                            </h3>

                            <div className="relative aspect-[4/3] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mb-3 newspaper-image-frame">
                              <Image src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop"} alt={article.title} fill className="object-cover" />
                            </div>

                            <div className="newspaper-byline mb-2 text-[#1a1a1a]">
                              By {article.author?.name || "Fact Flow Desk"} — {readTime}
                            </div>

                            <p className="font-newspaper-body text-sm leading-tight text-justify line-clamp-5 text-[#111111]">
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
              <div className="newspaper-ornament mt-8">✦ ✦ ✦</div>

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
