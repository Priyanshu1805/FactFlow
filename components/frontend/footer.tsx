"use client"

import { Instagram, Youtube, Facebook, AtSign } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

const socialLinks = [
  { 
    name: "Instagram", 
    icon: Instagram, 
    href: "https://www.instagram.com/fact__flow?igsh=cms3dWo1bjJuc2Ex", 
    style: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-[0_4px_14px_rgba(236,72,153,0.3)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.5)] border-pink-400/20"
  },
  { 
    name: "Facebook", 
    icon: Facebook, 
    href: "https://www.facebook.com/share/1AxNjs8P1N/", 
    style: "bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] border-blue-400/20"
  },
  { 
    name: "Threads", 
    icon: AtSign, 
    href: "https://www.threads.com/@fact__flow", 
    style: "bg-gradient-to-b from-zinc-700 to-black shadow-[0_4px_14px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)] border-zinc-600/30"
  },
  { 
    name: "YouTube", 
    icon: Youtube, 
    href: "https://youtube.com/@priyanshutalavekar?si=3WO9ApKy3YZjV-O5", 
    style: "bg-gradient-to-b from-red-500 to-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.5)] border-red-400/20"
  },
]

const productLinks = [
  { name: "Live", href: "/live" },
  { name: "Newspaper", href: "/newspaper" },
  { name: "Trending", href: "/#trending" },
  { name: "Social", href: "/social" },
]

const categoryLinks = [
  { name: "Politics", href: "/?category=politics" },
  { name: "Lifestyle", href: "/?category=lifestyle" },
  { name: "Sports", href: "/?category=sports" },
  { name: "Tech", href: "/?category=tech" },
  { name: "Art", href: "/#art" },
]

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Advertise with Us", href: "/advertise" },
  { name: "Help & FAQs", href: "/help" },
]

// BBC-style bottom strip — legal & policy links only (no duplicates from above)
const bottomLinks = [
  { name: "Terms of Use", href: "/terms" },
  { name: "Subscription Terms", href: "/subscription-terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Cookies", href: "/cookies" },
  { name: "Accessibility Help", href: "/accessibility" },
  { name: "Do Not Sell My Info", href: "/do-not-sell" },
]

export function Footer() {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  return (
    <footer className="border-t mt-8 bg-background border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand & Socials */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3.5 mb-5 cursor-pointer group w-fit">
              <div className="relative p-[1px] bg-gradient-to-tr from-red-500/30 via-purple-500/30 to-blue-500/30 rounded-xl shadow-sm">
                <div className="relative z-10 w-10 h-10 rounded-[10px] overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full select-none">
                    <text x="30" y="74" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="68" fill="#FFFFFF" textAnchor="middle">F</text>
                    <circle cx="50" cy="74" r="6" fill="#a8152e" />
                    <text x="70" y="74" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="68" fill="#FFFFFF" textAnchor="middle">F</text>
                  </svg>
                </div>
              </div>
              <div className="relative flex flex-col justify-center">
                <div className="flex items-center notranslate">
                  <span className="font-black text-xl tracking-tighter text-foreground" style={{ letterSpacing: "-0.05em" }}>FACT</span>
                  <span className="font-black text-xl tracking-tighter text-red-500 flex" style={{ letterSpacing: "-0.05em" }}>FLOW</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Your daily pulse of global news. Fast, accurate, and entertaining — all in one place.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`relative p-2.5 rounded-xl text-white transition-all duration-300 transform hover:-translate-y-1 border ${link.style}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                >
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity mix-blend-overlay"></div>
                  <link.icon className="w-4 h-4 relative z-10 drop-shadow-md" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-5 text-base">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-red-500 transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Category Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-5 text-base">Categories</h4>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-red-500 transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-5 text-base">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BBC-style Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-border">
          {/* Links row */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {bottomLinks.map((link, idx) => (
              <span key={link.name} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  {link.name}
                </Link>
                {idx < bottomLinks.length - 1 && (
                  <span className="text-border text-xs select-none">|</span>
                )}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-muted-foreground text-xs leading-relaxed notranslate">
            Copyright © {new Date().getFullYear()} Fact Flow. All rights reserved. Fact Flow is not responsible for the content of external sites.{" "}
            <Link href="/external-linking" className="hover:text-foreground underline underline-offset-2 transition-colors">
              Read about our approach to external linking.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
