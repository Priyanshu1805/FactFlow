import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cookie Policy | Fact Flow",
  description: "Fact Flow Cookie Policy — how we use cookies and tracking technologies, compliant with India's DPDPA 2023.",
}

const cookieTypes = [
  {
    name: "Essential Cookies",
    badge: "Always Active",
    badgeColor: "text-green-500 bg-green-500/10 border-green-500/20",
    retention: "Session – 30 days",
    description: "These cookies are strictly necessary for the Platform to function. Without them, you cannot log in, maintain a session, or use secured features.",
    examples: [
      { name: "auth_token", purpose: "Keeps you logged in securely during your session." },
      { name: "csrf_token", purpose: "Protects against cross-site request forgery attacks." },
      { name: "session_id", purpose: "Identifies your current browser session on our servers." },
      { name: "firebase_auth", purpose: "Manages your Google/email authentication state." },
    ],
    canDisable: false,
  },
  {
    name: "Analytics Cookies",
    badge: "Opt-In Required",
    badgeColor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    retention: "Up to 13 months",
    description: "These cookies help us understand how users interact with Fact Flow. All data is aggregated and anonymized — we cannot identify you personally from analytics data.",
    examples: [
      { name: "_ga / _gid", purpose: "Google Analytics — tracks page views, session duration, and traffic sources." },
      { name: "firebase_perf", purpose: "Firebase Performance — measures page load speed and app responsiveness." },
      { name: "_ff_session_events", purpose: "Internal Fact Flow analytics — tracks article reads, scroll depth, and click patterns." },
    ],
    canDisable: true,
  },
  {
    name: "Preference Cookies",
    badge: "Opt-In Required",
    badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    retention: "Up to 1 year",
    description: "These cookies remember your personal settings so you don't have to reconfigure them on every visit.",
    examples: [
      { name: "ff_theme", purpose: "Remembers whether you prefer Dark or Light mode." },
      { name: "ff_language", purpose: "Saves your preferred content language (e.g., English, Hindi)." },
      { name: "ff_region", purpose: "Stores your selected news region for localized content." },
      { name: "ff_video_mute", purpose: "Remembers your video autoplay and mute preferences." },
    ],
    canDisable: true,
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm">
            <strong>Effective Date:</strong> June 1, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> June 10, 2026
          </p>
        </div>

        {/* Compliance Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 mb-10">
          <p className="text-sm font-semibold text-red-500">
            This Cookie Policy is compliant with India's Digital Personal Data Protection Act, 2023 (DPDPA). We ask for your explicit opt-in consent before placing any non-essential cookies on your device.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* 1. What Are Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work properly, function more efficiently, and to provide information to the website's owners.
            </p>
            <p className="mt-3">
              Think of a cookie as a short note that a website leaves in your browser. When you come back, the website reads that note and "remembers" things about you — like that you're already logged in, or that you prefer the dark theme.
            </p>
            <p className="mt-3">
              Cookies can be:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Session Cookies:</strong> Temporary cookies that are deleted when you close your browser.</li>
              <li><strong className="text-foreground">Persistent Cookies:</strong> Cookies that remain on your device for a set period of time (or until you delete them).</li>
              <li><strong className="text-foreground">First-Party Cookies:</strong> Set directly by Fact Flow (factflow.com).</li>
              <li><strong className="text-foreground">Third-Party Cookies:</strong> Set by external services we use (e.g., Google Analytics, YouTube embeds).</li>
            </ul>
          </section>

          {/* 2. Types of Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Types of Cookies We Use</h2>
            <div className="space-y-5">
              {cookieTypes.map((type) => (
                <div key={type.name} className="border border-border rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-secondary/30">
                    <h3 className="font-bold text-foreground text-base">{type.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">Retention: {type.retention}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${type.badgeColor}`}>
                        {type.badge}
                      </span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="px-5 py-4">
                    <p className="mb-4">{type.description}</p>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-semibold text-foreground pr-4 w-1/3">Cookie Name</th>
                          <th className="text-left py-2 font-semibold text-foreground">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {type.examples.map((ex) => (
                          <tr key={ex.name} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-4 font-mono text-foreground/80 font-medium">{ex.name}</td>
                            <td className="py-2">{ex.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {type.canDisable && (
                      <p className="mt-3 text-xs text-yellow-500 font-medium">
                        ⚠️ You can disable these cookies via the cookie consent banner or your browser settings without affecting core Platform functionality.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Why We Use Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Why We Use Cookies</h2>
            <p>We use cookies for the following core reasons:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Security & Authentication:</strong> To securely authenticate your identity and protect your account from unauthorized access.</li>
              <li><strong className="text-foreground">Remembering Preferences:</strong> To save your settings (language, region, theme, font size) so you have a consistent experience on every visit.</li>
              <li><strong className="text-foreground">Measuring Traffic:</strong> To understand how many people visit the Platform, which articles are most popular, and where our users come from — helping us improve our content.</li>
              <li><strong className="text-foreground">Personalized News Feed:</strong> To remember your topic preferences and serve a more relevant, personalized news experience.</li>
              <li><strong className="text-foreground">Performance Optimization:</strong> To identify and fix technical bottlenecks that slow down the Platform.</li>
              <li><strong className="text-foreground">Advertising (where applicable):</strong> To measure the effectiveness of any advertisements displayed on the Platform and reduce irrelevant ads.</li>
            </ul>
          </section>

          {/* 4. Cookie Consent */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Cookie Consent</h2>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-4">
              <p className="text-green-500 font-semibold text-sm">
                In compliance with the DPDPA 2023, we obtain your explicit opt-in consent before placing any non-essential cookies (Analytics, Preference, and Marketing) on your device.
              </p>
            </div>
            <p>
              When you visit Fact Flow for the first time, you will see a <strong className="text-foreground">cookie consent banner</strong> that clearly explains what types of cookies we use. You can:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Accept All:</strong> Allow all cookie types, including analytics, preference, and marketing cookies.</li>
              <li><strong className="text-foreground">Reject Non-Essential:</strong> Allow only strictly essential cookies required for the Platform to function.</li>
              <li><strong className="text-foreground">Customize:</strong> Choose exactly which cookie categories you wish to allow.</li>
            </ul>
            <p className="mt-3">
              Your consent preference is stored and respected on subsequent visits. You can change your cookie preferences at any time by clearing your browser cookies or by contacting us.
            </p>
            <p className="mt-3">
              <strong className="text-foreground">Consent for Minors:</strong> In accordance with the DPDPA 2023, if a user is under the age of 18, parental or guardian consent is required before non-essential cookies are placed.
            </p>
          </section>

          {/* 5. How to Control Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. How to Control & Manage Cookies</h2>
            <p>You have full control over cookies. Here are your options:</p>

            <p className="font-semibold text-foreground mt-4 mb-2">5.1 Browser Settings</p>
            <p>All modern browsers allow you to manage cookies through settings. Here are direct links to cookie management instructions for popular browsers:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-in/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3">
              <strong className="text-foreground">Please note:</strong> Disabling essential cookies through browser settings may prevent you from logging in or using certain features of the Platform.
            </p>

            <p className="font-semibold text-foreground mt-4 mb-2">5.2 Opt-Out of Analytics</p>
            <p>
              To opt out of Google Analytics tracking across all websites, you can install the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </section>

          {/* 6. Third-Party Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Third-Party Cookies</h2>
            <p>
              Some features of the Platform involve content from trusted third-party services. These services may set their own cookies on your device, which are governed by their respective privacy and cookie policies:
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  name: "Google Analytics / Firebase",
                  use: "Used for anonymized traffic analysis and performance monitoring.",
                  policy: "https://policies.google.com/privacy",
                },
                {
                  name: "Social Media Share Buttons",
                  use: "If you use the Share button, the respective social platform (Facebook, Twitter/X, WhatsApp) may set cookies when you interact with their share widget.",
                  policy: null,
                },
                {
                  name: "Razorpay",
                  use: "Our payment processor may set cookies during the checkout process to ensure a secure transaction.",
                  policy: "https://razorpay.com/privacy/",
                },
              ].map((tp) => (
                <div key={tp.name} className="bg-secondary/40 border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground mb-1">{tp.name}</p>
                      <p className="text-xs">{tp.use}</p>
                    </div>
                    {tp.policy && (
                      <a href={tp.policy} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline shrink-0">
                        Privacy Policy →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Fact Flow has no control over the cookies set by third-party services. We recommend reviewing each service's privacy policy to understand their cookie practices.
            </p>
          </section>

          {/* 7. Cookie Retention */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Cookie Retention Periods</h2>
            <p>Different cookies remain on your device for different lengths of time:</p>
            <div className="mt-4 border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Cookie Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Retention Period</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Essential</td>
                    <td className="px-4 py-3">Session – 30 days</td>
                    <td className="px-4 py-3 text-xs">Auth tokens expire after 30 days of inactivity.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Analytics</td>
                    <td className="px-4 py-3">Up to 13 months</td>
                    <td className="px-4 py-3 text-xs">Google Analytics default retention; anonymized after 12 months.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Preference</td>
                    <td className="px-4 py-3">Up to 12 months</td>
                    <td className="px-4 py-3 text-xs">Reset when you change settings or clear browser data.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 8. Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Cookie Policy or want to exercise your cookie preferences, please contact us:
            </p>
            <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-5 space-y-2">
              <p><span className="text-foreground font-semibold">Platform:</span> Fact Flow (factflow.com)</p>
              <p>
                <span className="text-foreground font-semibold">Email:</span>{" "}
                <a href="mailto:factflow1819@gmail.com" className="text-red-500 hover:underline">factflow1819@gmail.com</a>
              </p>
              <p><span className="text-foreground font-semibold">Subject Line:</span> "Cookie Policy Query"</p>
              <p><span className="text-foreground font-semibold">Response Time:</span> Within 48 hours</p>
            </div>
            <p className="mt-4">
              Also see our full{" "}
              <Link href="/privacy" className="text-red-500 hover:underline">Privacy Policy</Link>{" "}
              for broader information on how we handle your personal data.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
