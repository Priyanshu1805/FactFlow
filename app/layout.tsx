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

export const metadata: Metadata = {
  title: "Fact Flow — Your Daily News Pulse",
  description: "Fast. Accurate. Entertaining. Breaking news, trending stories, and viral reels — all in one place.",
  keywords: ["news", "breaking news", "trending", "reels", "sports", "entertainment"],
  openGraph: {
    title: "Fact Flow",
    description: "Your Daily Pulse Of Global News",
    type: "website",
  },
}

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=UnifrakturMaguntia&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ClientShell>
              <Toaster position="bottom-right" />
              <DynamicClients />
              <TwoFactorGuard>
                <AccountStatusGuard>
                  <div className="flex flex-col min-h-screen pb-16">
                    {children}
                  </div>
                </AccountStatusGuard>
              </TwoFactorGuard>
            </ClientShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
