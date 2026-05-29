"use client"

import { Instagram, Youtube, Mail, MapPin, Phone, Send } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import Image from "next/image"
import Link from "next/link"

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/fact_flow", color: "hover:text-pink-500" },
  { name: "YouTube", icon: Youtube, href: "#", color: "hover:text-red-500" },
]

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Trending", href: "#trending" },
  { name: "Live News", href: "#live" },
  { name: "AI & Tech", href: "#ai-news" },
  { name: "Sports", href: "#sports" },
  { name: "Memes", href: "#memes" },
]

const categories = ["Breaking News", "Celebrities", "Crypto & Markets", "Entertainment", "Science", "World News"]

export function Footer() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <footer className="border-t mt-8 bg-background border-border">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3.5 mb-5 cursor-pointer group w-fit">
              {/* Logo Vector Container with Premium border */}
              <div className="relative p-[1px] bg-gradient-to-tr from-red-500/30 via-purple-500/30 to-blue-500/30 rounded-xl shadow-sm">
                
                {/* Vector SVG Emblem */}
                <div className="relative z-10 w-10 h-10 rounded-[10px] overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full select-none">
                    {/* Symmetrical exact F.F design */}
                    <text 
                      x="30" 
                      y="74" 
                      fontFamily="Georgia, 'Times New Roman', serif" 
                      fontWeight="bold" 
                      fontSize="68" 
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      F
                    </text>
                    
                    {/* Red Dot */}
                    <circle 
                      cx="50" 
                      cy="74" 
                      r="6" 
                      fill="#a8152e"
                    />
                    
                    <text 
                      x="70" 
                      y="74" 
                      fontFamily="Georgia, 'Times New Roman', serif" 
                      fontWeight="bold" 
                      fontSize="68" 
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      F
                    </text>
                  </svg>
                </div>
              </div>

              {/* Elegant Professional Brand Name */}
              <div className="relative flex flex-col justify-center">
                <div className="flex items-center">
                  <span className="font-black text-xl tracking-tighter text-foreground" style={{ letterSpacing: "-0.05em" }}>
                    FACT
                  </span>
                  
                  <span className="font-black text-xl tracking-tighter text-red-500 flex" style={{ letterSpacing: "-0.05em" }}>
                    FLOW
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">Digital News Platform</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Your daily pulse of global news. Fast, accurate, and entertaining — all in one place.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`p-3 sm:p-2.5 rounded-lg bg-secondary text-secondary-foreground transition-colors ${link.color}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-red-500 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-foreground font-semibold mb-5">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-red-500 transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-semibold mb-5">Contact Us</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                factflow1819@gmail.com
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                India
              </li>
            </ul>
            <p className="text-foreground text-xs mb-3">Subscribe to our newsletter</p>
            <div className="flex gap-2">
              <input
                suppressHydrationWarning
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-3 sm:py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
              <button suppressHydrationWarning className="p-3 sm:p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© 2026 Fact Flow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
