"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Cpu, ArrowRight, Clock, Eye, User } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"

export function TechSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { settings } = useSettings()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }
  const layout = settings?.layout || "comfortable"
  const [aiNews, setAiNews] = useState<any[]>([
    {
      id: "6a195cee4b5a75d2ee13390e",
      title: "After thousands of views, Meta and Google act on account depicting child labour",
      excerpt: "Meta and Google pulled down the account that featured a young girl making bricks, with one video garnering over 3 million views on X and over 10 million on Instagram",
      image: "https://th-i.thgim.com/public/incoming/i1k8cm/article71036536.ece/alternates/LANDSCAPE_1200/2025-12-17T145657Z_598779967_RC2DIIAWX0SF_RTRMADP_3_TECH-AI-GOOGLE-META.JPG",
      tag: "Tech",
      tagColor: "bg-red-500",
      time: "29/05/2026",
      featured: true,
      authorName: "The Hindu",
      readingTime: "3 min read",
      isPremium: false,
    },
    {
      id: "6a195cfc4b5a75d2ee133957",
      title: "Apple’s leaked Siri overhaul shows its biggest AI challenge to ChatGPT yet",
      excerpt: "Apple’s leaked Siri overhaul shows its biggest AI challenge to ChatGPT yet",
      image: "https://images.indianexpress.com/2026/05/apple-iphone-15-5.jpg.avif",
      tag: "Tech",
      tagColor: "bg-blue-500",
      time: "29/05/2026",
      featured: false,
      authorName: "Indian Express",
      readingTime: "1 min read",
      isPremium: true,
    },
    {
      id: "6a195cef4b5a75d2ee133911",
      title: "California sues 23andMe, alleging it failed to protect user data in 2023 breach",
      excerpt: "California’s attorney general is suing the genetic testing company formerly known as 23andMe",
      image: "https://th-i.thgim.com/public/incoming/d8n5bz/article71035806.ece/alternates/LANDSCAPE_1200/2025-03-25T165748Z_22229706_RC2FKDA2MSZX_RTRMADP_3_23ANDME-BANKRUPTCY-PRIVACY.JPG",
      tag: "Tech",
      tagColor: "bg-green-500",
      time: "29/05/2026",
      featured: false,
      authorName: "The Hindu",
      readingTime: "2 min read",
      isPremium: false,
    },
    {
      id: "6a193d504a801ef828f1e386",
      title: "CNN files lawsuit against Perplexity alleging unlawful content distribution",
      excerpt: "CNN is asking for an unspecified amount of monetary damages and a court order blocking Perplexity from violating its intellectual property rights",
      image: "https://th-i.thgim.com/public/incoming/9hyq05/article71035802.ece/alternates/LANDSCAPE_1200/2026-01-30T064152Z_1353172360_RC2LICAFU0KV_RTRMADP_3_MICROSOFT-PERPLEXITY-AI.JPG",
      tag: "Tech",
      tagColor: "bg-purple-500",
      time: "29/05/2026",
      featured: false,
      authorName: "The Hindu",
      readingTime: "2 min read",
      isPremium: false,
    }
  ])
  const [loading, setLoading] = useState(false)

  const featured = aiNews.find((n) => n.featured)
  const rest = aiNews.filter((n) => !n.featured)

  if (aiNews.length === 0 && !loading) return null;

  return (
    <section id="tech" className={`py-16 px-4 ${
      isDark ? "bg-gradient-to-b from-transparent via-purple-950/15 to-transparent" : "bg-gray-50/50"
    }`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/15 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Tech News
              </h2>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Latest in AI, tech, and innovation
              </p>
            </div>
          </div>
          <Link href="#breaking-updates" className="flex items-center gap-1.5 text-red-500 text-sm font-semibold hover:text-red-400 transition-colors">
            Live Updates <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className={`grid gap-6 transition-all duration-300 ${
          layout === "compact" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : 
          layout === "spacious" ? "grid-cols-1 max-w-4xl mx-auto" : 
          "grid-cols-1 lg:grid-cols-3"
        }`}>
          {layout === "comfortable" ? (
            <>
              {featured && (
                <Link href={`/article/${featured.id}`} className="lg:col-span-2 group cursor-pointer block">
                  <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl overflow-hidden border ${
                      isDark ? "bg-white/[0.04] border-white/10 hover:border-purple-500/40" : "bg-white border-gray-200 shadow-sm hover:shadow-xl"
                    } transition-all duration-500 h-full flex flex-col`}
                  >
                  {displayOptions.thumbnails !== false && (
                    <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                      <Image src={featured.image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className={`px-3 py-1 ${featured.tagColor} text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-lg`}>
                          {featured.tag}
                        </span>
{featured.isPremium && <PremiumBadge size="sm" />}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight line-clamp-2 drop-shadow-xl">
                          {featured.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col">
                    {displayOptions.thumbnails === false && (
                      <>
                        <span className={`inline-block px-3 py-1 ${featured.tagColor} text-white text-xs font-bold rounded-lg uppercase tracking-wider mb-3 w-max shadow-lg`}>
                          {featured.tag}
                        </span>
{featured.isPremium && <PremiumBadge size="sm" />}
                        <h3 className={`font-bold text-2xl leading-tight line-clamp-2 mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                          {featured.title}
                        </h3>
                      </>
                    )}
                    
                    <p className={`text-base leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                      {featured.excerpt}
                    </p>
                    
                    <div className="mt-auto space-y-3">
                      <div className={`flex items-center gap-4 text-xs ${isDark ? "text-white/50" : "text-gray-400"}`}>
                        {(displayOptions as any).authorName !== false && featured.authorName && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <User className="w-3 h-3 text-purple-400" />
                            </span>
                            {featured.authorName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featured.time}
                        </span>
                      </div>
                      
                      <div className={`pt-3 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
                        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        } group-hover:gap-3 transition-all duration-300`}>
                          Read article <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                  </motion.article>
                </Link>
              )}

              <div className="flex flex-col gap-4">
                {rest.map((article, index) => (
                  <Link href={`/article/${article.id}`} key={article.id} className="group cursor-pointer">
                    <motion.article
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-2xl overflow-hidden border flex flex-row gap-4 p-4 transition-all duration-300 ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 hover:border-purple-500/40 hover:bg-white/[0.07]"
                          : "bg-white border-gray-200 hover:shadow-lg hover:border-purple-200"
                      }`}
                    >
                    {displayOptions.thumbnails !== false && (
                      <div className="relative w-24 sm:w-28 h-24 sm:h-28 shrink-0 rounded-xl overflow-hidden">
                        <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 ${article.tagColor} text-white text-[10px] uppercase font-bold tracking-wider rounded-md`}>
                          {article.tag}
                        </span>
{article.isPremium && <PremiumBadge size="sm" />}
                      </div>
                      <h3 className={`font-semibold text-sm leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {article.title}
                      </h3>
                      <div className={`flex items-center gap-3 text-[11px] ${isDark ? "text-white/50" : "text-gray-400"}`}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {article.time}</span>
                      </div>
                    </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            aiNews.map((article, index) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group cursor-pointer">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 flex ${
                    layout === "compact" ? "flex-row items-center min-h-[100px] p-3 gap-4" : 
                    "flex-col p-6 gap-5" // spacious
                  } ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/8"
                      : "bg-white border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  {displayOptions.thumbnails !== false && (
                    <div className={`relative overflow-hidden shrink-0 ${
                      layout === "compact" ? "w-20 h-20 rounded-md" : 
                      "w-full h-72 rounded-lg" // spacious
                    }`}>
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  <div className={`flex flex-col flex-1 ${layout === "spacious" ? "p-2" : ""}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 ${article.tagColor} text-white text-[10px] uppercase font-bold tracking-wider rounded-md`}>
                        {article.tag}
                      </span>
{article.isPremium && <PremiumBadge size="sm" />}
                    </div>
                    
                    <h3 className={`font-bold leading-snug mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors ${
                      layout === "compact" ? "text-sm" : "text-2xl mt-2"
                    } ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {article.title}
                    </h3>
                    
                    {layout === "spacious" && (
                      <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-white/70" : "text-gray-500"}`}>
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="mt-auto">
                      <div className={`flex items-center flex-wrap gap-x-4 gap-y-2 text-xs ${layout === "spacious" ? "mb-4" : ""} ${isDark ? "text-white/60" : "text-gray-400"}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {article.time}
                        </div>
                      </div>
                      
                      {layout === "spacious" && (
                        <div className={`pt-4 border-t ${isDark ? "border-white/10 text-purple-400" : "border-gray-100 text-purple-600"} font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
                          Read full news <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
