import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { TwoFactorGuard } from "@/components/providers/two-factor-guard"
import { AccountStatusGuard } from "@/components/providers/account-status-guard"
import { Toaster } from "sonner"
import { DynamicClients } from "@/components/dynamic-clients"
import { ClientShell } from "@/components/client-shell"
import { AccessibilityProvider } from "@/components/accessibility-provider"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000"
}

export const metadata: Metadata = {
  metadataBase: new URL("https://factflow.news"),
  title: {
    default: "Fact Flow — Your Daily News Pulse",
    template: "%s | Fact Flow"
  },
  description: "Fast. Accurate. Entertaining. Breaking news, trending stories, and viral reels — all in one place.",
  keywords: ["news", "breaking news", "trending", "reels", "sports", "entertainment", "journalism", "live updates"],
  openGraph: {
    title: "Fact Flow",
    description: "Your Daily Pulse Of Global News",
    url: "https://factflow.news",
    siteName: "Fact Flow",
    images: "/og-image.jpg",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fact Flow — Your Daily News Pulse",
    description: "Fast. Accurate. Entertaining. Breaking news, trending stories, and viral reels — all in one place.",
    creator: "@FactFlowNews",
  },
}

import { SocketProvider } from "@/components/providers/socket-provider"
import { RegionProvider } from "@/components/providers/region-provider"
import { GoogleTranslate } from "@/components/google-translate"
import { FeedInitializer } from "@/components/providers/feed-initializer"



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script 
          id="abort-error-suppressor" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && (event.reason.name === 'AbortError' || (event.reason.message && event.reason.message.includes('play()')))) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                }
              }, { capture: true });
            `
          }}
        />
        
        {/* Google AdSense Global Script */}
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" strategy="afterInteractive" />
        <GoogleTranslate />
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider>
              <AccessibilityProvider>
                <ClientShell>
                  <Toaster position="bottom-right" />
                  <DynamicClients />
                  <TwoFactorGuard>
                    <AccountStatusGuard>
                      <RegionProvider>
                        <FeedInitializer />
                        <div className="flex flex-col min-h-screen">
                          {children}
                        </div>
                      </RegionProvider>
                    </AccountStatusGuard>
                  </TwoFactorGuard>
                </ClientShell>
              </AccessibilityProvider>
            </ThemeProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
