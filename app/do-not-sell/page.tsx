import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Do Not Sell My Information | Fact Flow",
  description: "Your right to opt out of data selling under India's DPDPA 2023, CCPA, and GDPR.",
}

export default function DoNotSellPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Do Not Sell My Info</h1>
          <p className="text-muted-foreground text-sm">
            <strong>Effective Date:</strong> June 1, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> June 10, 2026
          </p>
        </div>

        {/* The Big Promise */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Our Promise: We Do Not Sell Your Data</h2>
          <p className="text-foreground leading-relaxed">
            Fact Flow firmly believes that your personal data belongs to you. We want to be completely transparent: <strong className="text-red-500 font-bold">We do NOT sell, rent, or trade your personal information to any third parties for their commercial purposes.</strong>
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* 1. What This Page Is About */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. What This Page Is About</h2>
            <p>
              In compliance with India's Digital Personal Data Protection Act, 2023 (DPDPA), this page outlines your right to opt out of any potential data sharing and explains exactly how your data is handled by Fact Flow. While we do not sell your data, you still have the right to request deletion or formally opt out of data sharing.
            </p>
          </section>

          {/* 2. What Data We Share and Why */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. What Data We Share and Why</h2>
            <p>We only share data with essential service providers necessary to operate the Platform:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Hosting & Security:</strong> We use secure servers (e.g., MongoDB Atlas) to store your account data.</li>
              <li><strong className="text-foreground">Payment Processors:</strong> If you buy a Premium subscription, Razorpay securely processes your payment.</li>
              <li><strong className="text-foreground">Analytics:</strong> We use anonymized analytics to see which articles are popular so we can improve our content.</li>
            </ul>
            <p className="mt-3">These providers are bound by strict legal contracts and cannot use your data for their own marketing or sales.</p>
          </section>

          {/* 3. How to Submit a Request */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Submit an Opt-Out or Deletion Request</h2>
            <p className="mb-4">
              Even though we do not sell your data, you have the right to request the complete deletion of your account and personal data from our servers.
            </p>
            <div className="bg-secondary/40 border border-border p-6 rounded-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-foreground">Request Data Deletion</h4>
                <p className="text-xs text-muted-foreground">Send an email request to our privacy team.</p>
              </div>
              <a 
                href="mailto:factflow1819@gmail.com?subject=Data Deletion Request" 
                className="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Submit Request
              </a>
            </div>
          </section>

          {/* 4. What Happens After Request */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. What Happens After Your Request?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Confirmation:</strong> You will receive an acknowledgment email within 48 hours of submitting your request.</li>
              <li><strong className="text-foreground">Timeline:</strong> Under the DPDPA 2023, we will process and fulfill your deletion or opt-out request within <strong>30 days</strong>.</li>
              <li><strong className="text-foreground">Result:</strong> Once processed, your account, reading history, and personal details will be permanently deleted from our active databases.</li>
            </ul>
          </section>

          {/* 5. Your Additional Rights */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Your Additional Rights</h2>
            <p>Under the DPDPA 2023, you also have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li><strong>Access:</strong> Request a summary of the personal data we hold about you.</li>
              <li><strong>Correct:</strong> Update or fix any inaccurate data in your account.</li>
              <li><strong>Withdraw Consent:</strong> Change your mind about cookies or marketing emails at any time.</li>
            </ul>
            <p className="mt-3">See our <Link href="/privacy" className="text-red-500 hover:underline">Privacy Policy</Link> for full details.</p>
          </section>

          {/* 6. California (CCPA) & European (GDPR) Users */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Notice for Global Users (CCPA / GDPR)</h2>
            <p>
              While Fact Flow is governed by Indian law, we recognize the privacy rights of our global users:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">California Residents (CCPA/CPRA):</strong> We do not sell your personal information. You have the right to request access to and deletion of your data.</li>
              <li><strong className="text-foreground">European Union Residents (GDPR):</strong> You have the right to access, rectify, or erase your personal data, and the right to data portability.</li>
            </ul>
            <p className="mt-3">Users from these regions can exercise their rights using the contact information below.</p>
          </section>

          {/* 7. Contact Grievance Officer */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Contact the Grievance Officer</h2>
            <p>
              If you have any questions or complaints regarding your privacy or data rights, please contact our appointed Grievance Officer as required by Indian law:
            </p>
            <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-5 space-y-1">
              <p><span className="text-foreground font-semibold">Grievance Officer:</span> Privacy Team, Fact Flow</p>
              <p><span className="text-foreground font-semibold">Email:</span>{" "}
                <a href="mailto:factflow1819@gmail.com" className="text-red-500 hover:underline">factflow1819@gmail.com</a>
              </p>
              <p><span className="text-foreground font-semibold">Jurisdiction:</span> India</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
