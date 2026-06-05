"use client"

import dynamic from "next/dynamic"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRssStore } from "@/lib/rss/rssStore"

const Navbar = dynamic(() => import("@/components/frontend/navbar").then(m => ({ default: m.Navbar })), { ssr: false })
const HeroContent = dynamic(() => import("@/components/frontend/hero-content").then(m => ({ default: m.HeroContent })), { ssr: false })
const BackgroundScene = dynamic(() => import("@/components/ui/cybercore-section-hero"), { ssr: false })
const Footer = dynamic(() => import("@/components/frontend/footer").then(m => ({ default: m.Footer })), { ssr: false })
const BreakingNewsHero = dynamic(() => import("@/components/frontend/breaking-news-hero").then(m => ({ default: m.BreakingNewsHero })), { ssr: false })
const NewsTicker = dynamic(() => import("@/components/frontend/news-ticker").then(m => ({ default: m.NewsTicker })), { ssr: false })
const NewspaperSection = dynamic(() => import("@/components/frontend/newspaper-section").then(m => ({ default: m.NewspaperSection })), { ssr: false })
const PoliticsSection = dynamic(() => import("@/components/frontend/politics-section").then(m => ({ default: m.PoliticsSection })), { ssr: false })
const TrendingSection = dynamic(() => import("@/components/frontend/trending-section").then(m => ({ default: m.TrendingSection })), { ssr: false })
const LifestyleSection = dynamic(() => import("@/components/frontend/lifestyle-section").then(m => ({ default: m.LifestyleSection })), { ssr: false })
const SportsSection = dynamic(() => import("@/components/frontend/sports-section").then(m => ({ default: m.SportsSection })), { ssr: false })
const TechSection = dynamic(() => import("@/components/frontend/tech-section").then(m => ({ default: m.TechSection })), { ssr: false })
const MemesSection = dynamic(() => import("@/components/frontend/memes-section").then(m => ({ default: m.MemesSection })), { ssr: false })
const ReelsCarouselSection = dynamic(() => import("@/components/frontend/reels-carousel-section").then(m => ({ default: m.ReelsCarouselSection })), { ssr: false })

function SectionLoader() {
  return <div className="w-full h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
}

function NavbarLoader() {
  return <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-xl border-b border-white/10" />
}

export default function HomePage() {
  const { theme } = useTheme()
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    // Fetch RSS feeds on mount so the content updates
    useRssStore.getState().fetchNews(true) // force=true ensures fresh fetch on page load
    
    // Check saved categories
    const savedCats = localStorage.getItem("newsCategories")
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats))
      } catch (e) {}
    }
  }, []) // Empty dependency array

  const hasCat = (catId: string) => categories.length === 0 || categories.includes(catId)

  const bg =
    theme === "light"
      ? "bg-white"
      : theme === "glass"
      ? "bg-gradient-to-b from-purple-900/30 via-black to-black"
      : "bg-black"

  return (
    <main className={`min-h-screen ${bg} transition-colors duration-500`}>
      <Suspense fallback={<NavbarLoader />}>
        <Navbar />
      </Suspense>

      {/* Hero Section */}
      <section className="relative pt-16 w-full min-h-[90vh] overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-60">
          <Suspense fallback={null}>
            <BackgroundScene />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none" />
        <Suspense fallback={<SectionLoader />}>
          <HeroContent />
        </Suspense>
      </section>

      {/* Breaking News / Live Updates Section */}
      <div id="breaking-updates" className="scroll-mt-20">
        <Suspense fallback={<SectionLoader />}>
          <BreakingNewsHero />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <NewsTicker />
        </Suspense>
      </div>

      {hasCat("World News") && (
        <Suspense fallback={<SectionLoader />}>
          <NewspaperSection />
        </Suspense>
      )}

      {hasCat("Politics") && (
        <Suspense fallback={<SectionLoader />}>
          <PoliticsSection />
        </Suspense>
      )}

      {(hasCat("World News") || hasCat("Crypto & Finance")) && (
        <Suspense fallback={<SectionLoader />}>
          <TrendingSection />
        </Suspense>
      )}



      {(hasCat("Entertainment") || hasCat("Celebrities")) && (
        <Suspense fallback={<SectionLoader />}>
          <LifestyleSection />
        </Suspense>
      )}

      {hasCat("Sports") && (
        <Suspense fallback={<SectionLoader />}>
          <SportsSection />
        </Suspense>
      )}

      {(hasCat("Technology") || hasCat("Science")) && (
        <Suspense fallback={<SectionLoader />}>
          <TechSection />
        </Suspense>
      )}

      {hasCat("Memes & Viral") && (
        <Suspense fallback={<SectionLoader />}>
          <MemesSection />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </main>
  )
}
