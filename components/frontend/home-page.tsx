"use client"

import dynamic from "next/dynamic"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { Suspense } from "react"

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

function SectionLoader() {
  return <div className="w-full h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
}

function NavbarLoader() {
  return <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/90 backdrop-blur-xl border-b border-white/10" />
}

export default function HomePage() {
  const { theme } = useTheme()

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

      {/* Breaking News Section */}
      <div id="breaking-updates" className="scroll-mt-20">
        <Suspense fallback={<SectionLoader />}>
          <BreakingNewsHero />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <NewsTicker />
        </Suspense>
      </div>

      <Suspense fallback={<SectionLoader />}>
        <NewspaperSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <PoliticsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TrendingSection />
      </Suspense>

      {/* News Shorts Redirect */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/live#news-shorts" className="block relative overflow-hidden rounded-2xl group border border-red-500/20 bg-gradient-to-r from-red-950/40 to-black p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-red-400 transition-colors flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                News Shorts
              </h2>
              <p className="text-white/[0.85] font-medium max-w-xl">
                Quick updates and trending short videos have moved! Catch up on the latest rapid-fire news in our new dedicated Live section.
              </p>
            </div>
            <div className="flex-shrink-0 bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all group-hover:bg-red-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]">
              Watch Shorts Now
            </div>
          </div>
        </Link>
      </div>

      <Suspense fallback={<SectionLoader />}>
        <LifestyleSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <SportsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TechSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <MemesSection />
      </Suspense>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </main>
  )
}
