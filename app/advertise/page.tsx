import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Advertise with Us | Fact Flow",
  description: "Reach millions of engaged news readers by advertising on Fact Flow.",
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            Advertise with <span className="text-red-500">Fact Flow</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reach a highly engaged audience of news readers across India and beyond. Partner with Fact Flow to grow your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: "Daily Active Users", value: "Growing Fast", icon: "👥" },
            { label: "News Categories", value: "10+", icon: "📰" },
            { label: "Avg. Session Time", value: "8+ mins", icon: "⏱️" },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/40 border border-border p-6 rounded-2xl text-center">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-black text-foreground mb-1">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Interested in advertising opportunities, sponsored content, or brand partnerships? Reach out to our team and we'll get back to you with our media kit and pricing.
          </p>
          <a
            href="mailto:factflow1819@gmail.com?subject=Advertising Inquiry"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
          >
            Contact Advertising Team
          </a>
          <p className="text-muted-foreground text-sm mt-4">factflow1819@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
