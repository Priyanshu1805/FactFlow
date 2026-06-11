import type { Metadata } from "next"
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
    images: [
      {
        url: "/og-image.jpg", // Make sure this exists in public folder
        width: 1200,
        height: 630,
        alt: "Fact Flow - Daily News Pulse"
      }
    ],
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
      <head>
        <Script id="abort-error-suppressor" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && (event.reason.name === 'AbortError' || (event.reason.message && event.reason.message.includes('play()')))) {
              event.preventDefault();
              event.stopImmediatePropagation();
            }
          }, { capture: true });
        `}} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=UnifrakturMaguntia&display=swap" rel="stylesheet" />
      </head>
      <body>
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
