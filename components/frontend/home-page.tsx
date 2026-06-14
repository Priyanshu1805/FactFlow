"use client"


import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { Suspense, useEffect, useState } from "react"
import { useRssStore } from "@/lib/rss/rssStore"
import { useRegion } from "@/components/providers/region-provider"
import { useFeedStore } from "@/lib/store/feed-store"

import { Navbar } from "@/components/frontend/navbar"
import { HeroContent } from "@/components/frontend/hero-content"
// BackgroundScene is now dynamically imported below with ssr:false
import { Footer } from "@/components/frontend/footer"
import { BreakingNewsHero } from "@/components/frontend/breaking-news-hero"
import { useSubscription } from "@/lib/use-subscription"
import { NewsTicker } from "@/components/frontend/news-ticker"
import { AdBanner } from "@/components/frontend/ad-banner"

import dynamic from "next/dynamic"

const BackgroundScene = dynamic(() => import("@/components/ui/cybercore-section-hero"), { ssr: false })
const NewspaperSection = dynamic(() => import("@/components/frontend/newspaper-section").then(m => m.NewspaperSection), { ssr: false })
const PoliticsSection = dynamic(() => import("@/components/frontend/politics-section").then(m => m.PoliticsSection), { ssr: false })
const TrendingSection = dynamic(() => import("@/components/frontend/trending-section").then(m => m.TrendingSection), { ssr: false })
const SportsSection = dynamic(() => import("@/components/frontend/sports-section").then(m => m.SportsSection), { ssr: false })
const LifestyleSection = dynamic(() => import("@/components/frontend/lifestyle-section").then(m => m.LifestyleSection), { ssr: false })
const TechSection = dynamic(() => import("@/components/frontend/tech-section").then(m => m.TechSection), { ssr: false })
const ArtSection = dynamic(() => import("@/components/frontend/art-section").then(m => m.ArtSection), { ssr: false })
const InternationalTopNews = dynamic(() => import("@/components/frontend/international-top-news").then(m => m.InternationalTopNews), { ssr: false })

function SectionLoader() {
  return <div className="w-full h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
}

function NavbarLoader() {
  return <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-xl border-b border-white/10" />
}

export default function HomePage() {
  const { theme } = useTheme()
  const { region } = useRegion()
  const { followedTopics } = useFeedStore()
  const { canAccess } = useSubscription()
  const { user } = useAuthStore()
  const isOwnerOrAdmin = user?.email?.toLowerCase().trim() === "factflow1819@gmail.com" || user?.role === "admin";

  useEffect(() => {
    // Fetch RSS feeds on mount or region change
    useRssStore.getState().fetchNews(true, region.code) 
  }, [region.code])

  const hasCat = (catId: string) => followedTopics.length === 0 || followedTopics.includes(catId)

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

      {/* International Top News */}
      <Suspense fallback={<SectionLoader />}>
        <InternationalTopNews />
      </Suspense>

      {/* ── SECTION ORDER: Newspaper → Politics → Trending → Sports → Lifestyle → Tech → Art ── */}

      <Suspense fallback={<SectionLoader />}>
        <NewspaperSection />
      </Suspense>

      <Suspense fallback={null}>
        <AdBanner className="my-4" />
      </Suspense>

      {(isOwnerOrAdmin || canAccess("weekly")) && hasCat("politics") && (
        <Suspense fallback={<SectionLoader />}>
          <PoliticsSection />
        </Suspense>
      )}

      {(isOwnerOrAdmin || canAccess("weekly")) && hasCat("trending") && (
        <Suspense fallback={<SectionLoader />}>
          <TrendingSection />
        </Suspense>
      )}

      {(isOwnerOrAdmin || canAccess("weekly")) && hasCat("lifestyle") && (
        <Suspense fallback={<SectionLoader />}>
          <LifestyleSection />
        </Suspense>
      )}

      {(isOwnerOrAdmin || canAccess("weekly")) && hasCat("sports") && (
        <Suspense fallback={<SectionLoader />}>
          <SportsSection />
        </Suspense>
      )}

      {(isOwnerOrAdmin || canAccess("weekly")) && hasCat("tech") && (
        <Suspense fallback={<SectionLoader />}>
          <TechSection />
        </Suspense>
      )}

      {(isOwnerOrAdmin || canAccess("weekly")) && hasCat("art") && (
        <Suspense fallback={<SectionLoader />}>
          <ArtSection />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </main>
  )
}
