"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Clock, ArrowRight, Eye, User } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"

export function SportsSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { settings } = useSettings()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }
  const layout = settings?.layout || "comfortable"
  const [sportsNews, setSportsNews] = useState<any[]>([
    {
      id: "6a195ce74b5a75d2ee1338e1",
      title: "‘Mentally stressed’ Hardik Pandya is ‘done with Mumbai Indians’",
      excerpt: "The 32-year-old Pandya, who took over the leadership in 2024 replacing Rohit Sharma, informed the Mumbai Indians management about leaving the franchise weeks before the team's disastrous IPL campaign",
      image: "https://th-i.thgim.com/public/incoming/q3ebc/article71036577.ece/alternates/LANDSCAPE_1200/DSC_7652.JPG",
      tag: "Sports",
      tagColor: "bg-red-500",
      time: "29/05/2026",
      featured: true,
      authorName: "The Hindu",
      readingTime: "4 min read",
      isPremium: false,
    },
    {
      id: "6a195ce84b5a75d2ee1338e4",
      title: "Three Indian ice hockey teams to compete at IIHF World Championships",
      excerpt: "Three Indian ice hockey teams will compete at the 2027 IIHF World Championships, marking a significant milestone for the sport",
      image: "https://th-i.thgim.com/public/incoming/g78zqx/article71036558.ece/alternates/LANDSCAPE_1200/Royal%20Enfield%20Ice%20Hockey%20League%20-%20Season%202%2012%2001%20LEH%20DELHI%20SPORTSTAR%20CHENNAI%2019.JPG",
      tag: "Sports",
      tagColor: "bg-blue-500",
      time: "29/05/2026",
      featured: false,
      authorName: "The Hindu",
      readingTime: "2 min read",
      isPremium: false,
    },
    {
      id: "6a195d104b5a75d2ee1339cd",
      title: "Iran FIFA World Cup ambassador raises alarm over US visas, claims team 'not participating on equal terms'",
      excerpt: "Iran is scheduled to play three of its group-stage games in Los Angeles and Seattle.",
      image: "https://www.hindustantimes.com/ht-img/img/2026/05/29/550x309/SOCCER-FRIENDLY-IRN-GMB-PREVIEW-14_1780044374986_1780044391650_6527edb1-e9fe-4dd0-b7a8-339e1b1bcf6b.JPG",
      tag: "Sports",
      tagColor: "bg-green-500",
      time: "29/05/2026",
      featured: false,
      authorName: "Hindustan Times",
      readingTime: "2 min read",
      isPremium: true,
    },
    {
      id: "6a195d104b5a75d2ee1339d0",
      title: "Sindhu falls to nemesis An Se Young in Singapore Open",
      excerpt: "Sindhu falls to nemesis An Se Young in Singapore Open",
      image: "https://www.hindustantimes.com/ht-img/img/2025/06/30/550x309/ht-generic_sports3_1751287397748_1751287408612.jpg",
      tag: "Sports",
      tagColor: "bg-purple-500",
      time: "29/05/2026",
      featured: false,
      authorName: "Hindustan Times",
      readingTime: "3 min read",
      isPremium: false,
    }
  ])
  const [loading, setLoading] = useState(false)

  const featured = sportsNews.find((n) => n.featured) || sportsNews[0]
  const rest = sportsNews.filter((n) => !n.featured)

  if (sportsNews.length === 0 && !loading) return null;

  return (
    <section id="sports" className={`py-16 px-4 ${
      isDark ? "bg-gradient-to-b from-transparent via-blue-950/15 to-transparent" : "bg-gray-50/50"
    }`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Sports Updates
              </h2>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Latest scores, highlights, and news
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
                      isDark ? "bg-white/[0.04] border-white/10 hover:border-blue-500/40" : "bg-white border-gray-200 shadow-sm hover:shadow-xl"
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
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-400" />
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
                          isDark ? "text-blue-400" : "text-blue-600"
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
                          ? "bg-white/[0.04] border-white/10 hover:border-blue-500/40 hover:bg-white/[0.07]"
                          : "bg-white border-gray-200 hover:shadow-lg hover:border-blue-200"
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
                      <h3 className={`font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors ${
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
            sportsNews.map((article, index) => (
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
                      ? "bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/8"
                      : "bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
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
                    
                    <h3 className={`font-bold leading-snug mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors ${
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
                        <div className={`pt-4 border-t ${isDark ? "border-white/10 text-blue-400" : "border-gray-100 text-blue-600"} font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
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
