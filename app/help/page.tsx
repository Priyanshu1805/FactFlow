import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Help & FAQs | Fact Flow",
  description: "Frequently asked questions and help guide for Fact Flow.",
}

const faqs = [
  {
    q: "How do I create an account?",
    a: "Click the 'Login' button in the top right corner of the page. You can sign up using your Google account or email address.",
  },
  {
    q: "What is the difference between Free and Pro/Premium plans?",
    a: "The free plan gives you access to all news content. Pro and Premium plans unlock an ad-free experience, personalized news digest emails, exclusive content, and advanced customization options.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Subscription → and click 'Cancel Subscription'. Please note that all payments are strictly non-refundable. You will retain access to premium features until the end of your current billing period, after which you will not be charged again.",
  },
  {
    q: "How do I customize my news feed?",
    a: "Go to Settings → News Feed & Language to choose your preferred topics, sources, and language. Your feed will update accordingly.",
  },
  {
    q: "How do I report incorrect or inappropriate content?",
    a: "For social posts, reels, and comments, click the three-dot menu (⋯) and select 'Report'. For regular news articles, please contact us at factflow1819@gmail.com with the article link, and our team will review it promptly.",
  },
  {
    q: "Can I read news in my regional language?",
    a: "Yes! Go to Settings → News Feed & Language and choose your preferred language from the available options.",
  },
  {
    q: "How do I turn off notifications?",
    a: "Go to Settings → Notifications and toggle off any notification types you do not want to receive.",
  },
  {
    q: "I found a bug. How do I report it?",
    a: "Please contact us at factflow1819@gmail.com with a description of the issue and we'll fix it as soon as possible.",
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
            Help & <span className="text-red-500">FAQs</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Find answers to the most common questions about Fact Flow.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-foreground mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-secondary/40 border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-3">Still need help?</h2>
          <p className="text-muted-foreground mb-5">Our team is here to assist you.</p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
