import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use | Fact Flow",
  description: "Terms of Use for Fact Flow — the digital news platform governed by Indian law.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Terms of Use</h1>
          <p className="text-muted-foreground text-sm">
            <strong>Effective Date:</strong> June 1, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> June 10, 2026
          </p>
        </div>

        {/* Intro Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 mb-10">
          <p className="text-sm font-semibold text-red-500">
            IMPORTANT: Please read these Terms of Use carefully before accessing or using the Fact Flow platform. By continuing to use this website, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, please discontinue use immediately.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* 1. Acceptance */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              These Terms of Use ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and Fact Flow ("Company", "we", "us", or "our"), governing your access to and use of the Fact Flow website located at <strong className="text-foreground">factflow.com</strong>, including all associated subdomains, mobile applications, and services (collectively, the "Platform").
            </p>
            <p className="mt-3">
              By accessing or using the Platform in any manner — including browsing content, creating an account, posting comments, or subscribing to any service — you unconditionally accept and agree to be bound by these Terms and all policies incorporated herein by reference, including our Privacy Policy and Cookie Policy.
            </p>
            <p className="mt-3">
              If you are using this Platform on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.
            </p>
          </section>

          {/* 2. Who We Are */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Who We Are</h2>
            <p>
              Fact Flow is a digital news aggregation and publishing platform headquartered in India. Our Platform delivers curated news content from verified sources across categories including politics, technology, sports, entertainment, finance, and more.
            </p>
            <p className="mt-3">
              Fact Flow operates as an intermediary platform under the Information Technology Act, 2000 ("IT Act") and its amendments, and complies with the Digital Personal Data Protection Act, 2023 ("DPDPA"). We strive to provide accurate, timely, and trustworthy news content while fostering a respectful user community.
            </p>
            <p className="mt-3">
              For any legal communications, you may contact us at: <strong className="text-red-500">factflow1819@gmail.com</strong>
            </p>
          </section>

          {/* 3. Use of the Website */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Use of the Website</h2>
            <p className="font-semibold text-foreground mb-2">3.1 Permitted Uses</p>
            <p>You may use the Platform solely for lawful, personal, non-commercial purposes. You are permitted to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Browse and read publicly available news content.</li>
              <li>Create a personal account and customize your news feed.</li>
              <li>Share articles on social media using the provided share functionality.</li>
              <li>Post comments and interact with the community in a respectful manner.</li>
              <li>Subscribe to paid plans for premium features.</li>
            </ul>

            <p className="font-semibold text-foreground mt-5 mb-2">3.2 Prohibited Uses</p>
            <p>You expressly agree NOT to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use any automated tool, bot, crawler, scraper, or data mining software to extract content from the Platform without prior written consent.</li>
              <li>Reproduce, republish, redistribute, or commercially exploit any content from the Platform without authorization.</li>
              <li>Transmit any unsolicited commercial messages, spam, or chain letters through the Platform.</li>
              <li>Create fake, duplicate, or impersonating accounts.</li>
              <li>Attempt to gain unauthorized access to any server, database, or account associated with the Platform.</li>
              <li>Upload or transmit malware, viruses, or any malicious code.</li>
              <li>Post content that is defamatory, obscene, hateful, communally sensitive, or violates any applicable law.</li>
              <li>Use the Platform to spread misinformation, fake news, or propaganda.</li>
              <li>Circumvent, disable, or otherwise interfere with any security-related features of the Platform.</li>
              <li>Engage in any activity that imposes an unreasonable or disproportionately large load on our infrastructure.</li>
            </ul>
            <p className="mt-3">
              Violation of these prohibited uses may result in immediate account termination and may expose you to civil or criminal liability under applicable Indian law.
            </p>
          </section>

          {/* 4. User Accounts */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. User Accounts</h2>
            <p className="font-semibold text-foreground mb-2">4.1 Registration</p>
            <p>
              Certain features of the Platform require you to register for an account. You agree to provide accurate, current, and complete information during registration and to keep this information updated. You must be at least 13 years of age to create an account, and 18 years of age to subscribe to any paid plan.
            </p>
            <p className="font-semibold text-foreground mt-4 mb-2">4.2 Account Security & Password Responsibility</p>
            <p>
              You are solely responsible for maintaining the confidentiality of your account credentials, including your password. You agree to immediately notify us at <strong className="text-red-500">factflow1819@gmail.com</strong> of any unauthorized use of your account or any other security breach. Fact Flow will not be liable for any loss or damage arising from your failure to safeguard your account.
            </p>
            <p className="font-semibold text-foreground mt-4 mb-2">4.3 Account Termination</p>
            <p>
              Fact Flow reserves the right, at its sole discretion, to suspend or permanently terminate your account without notice if you are found to be in violation of these Terms, applicable laws, or community guidelines. Upon termination, your right to access the Platform ceases immediately. You may also delete your account at any time through your account settings.
            </p>
          </section>

          {/* 5. Content Aggregation & Fair Use */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Content Aggregation, Embedded Media & Fair Use</h2>
            <p className="font-semibold text-foreground mb-2">5.1 News Aggregation</p>
            <p>
              Fact Flow operates primarily as a news aggregator and intermediary under Section 79 of the Information Technology Act, 2000. We curate, summarize, and link to news articles, images, and headlines from third-party publishers. All third-party content, trademarks, and copyrights remain the exclusive property of their respective owners. Fact Flow does not claim ownership over aggregated third-party news content.
            </p>
            <p className="mt-3">
              We display this content strictly under the principles of "Fair Dealing" (Section 52 of the Copyright Act, 1957) for the purposes of reporting current events, providing commentary, and facilitating access to information. Every aggregated article includes proper attribution and a direct hyperlink to the original source.
            </p>
            
            <p className="font-semibold text-foreground mt-5 mb-2">5.2 Embedded Media (YouTube & External Video)</p>
            <p>
              Our Platform frequently utilizes standard web embedding technologies (e.g., iframes) to display publicly available videos from external platforms like YouTube, Twitter/X, and others. 
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Embedding a video does not constitute hosting, downloading, or copying the video files onto our servers. The video remains hosted on the original platform (e.g., YouTube's servers) and is governed by that platform's Terms of Service and API terms.</li>
              <li>Fact Flow does not alter, monetize independently, or claim ownership over any embedded third-party video.</li>
              <li>If you are a copyright owner and believe an embedded video infringes on your rights, please note that the most effective way to remove the content is to file a takedown notice directly with the host platform (e.g., YouTube). Once removed from the host platform, the embed on Fact Flow will automatically cease to function.</li>
            </ul>

            <p className="font-semibold text-foreground mt-5 mb-2">5.3 Fact Flow Original Content</p>
            <p>
              Any original content created exclusively by Fact Flow — including our custom summaries, UI elements, logos, and software code — is the exclusive intellectual property of Fact Flow and is protected under applicable intellectual property laws. You may not reproduce our original content without prior written permission.
            </p>
          </section>

          {/* 6. UGC */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. User-Generated Content</h2>
            <p>
              The Platform may allow you to submit, post, or share content including comments, opinions, ideas, and social interactions ("User Content"). By submitting User Content, you represent that you own or have the necessary rights to such content and that it does not infringe any third-party rights.
            </p>
            <p className="mt-3">
              By submitting User Content, you grant Fact Flow a non-exclusive, royalty-free, worldwide, sublicensable, and transferable license to use, reproduce, modify, distribute, and display such content in connection with operating and improving the Platform.
            </p>
            <p className="mt-3">
              Fact Flow acts as an intermediary and is not liable for User Content under Section 79 of the IT Act, 2000. However, we reserve the right to remove any User Content that violates these Terms, applicable law, or our community guidelines, without prior notice.
            </p>
          </section>

          {/* 7. Third-Party Links */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Third-Party Links & External Sites</h2>
            <p>
              The Platform contains hyperlinks to third-party websites, news sources, and online platforms. These links are provided solely for informational and navigational convenience. Fact Flow does not endorse, control, or take responsibility for the content, privacy practices, or accuracy of any third-party website.
            </p>
            <p className="mt-3">
              Your access to and use of any linked third-party website is at your own risk and subject to that website's own terms and conditions and privacy policy. We encourage you to review those policies before interacting with any third-party site.
            </p>
          </section>

          {/* 8. Disclaimer */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Disclaimer of Warranties</h2>
            <p className="uppercase font-semibold text-foreground text-xs mb-2">Please read this section carefully.</p>
            <p>
              THE PLATFORM AND ALL CONTENT, SERVICES, AND FEATURES THEREIN ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. FACT FLOW EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              All news and informational content on the Platform is for general informational purposes only and should not be construed as professional, legal, medical, financial, or investment advice. Fact Flow does not warrant the completeness, accuracy, timeliness, or reliability of any content on the Platform.
            </p>
            <p className="mt-3">
              Fact Flow does not guarantee that the Platform will be uninterrupted, error-free, secure, or free from viruses or other harmful components.
            </p>
          </section>

          {/* 9. Liability */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Limitation of Liability</h2>
            <p className="uppercase font-semibold text-foreground text-xs mb-2">Please read this section carefully.</p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE INDIAN LAW, IN NO EVENT SHALL FACT FLOW, ITS DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES WHATSOEVER, INCLUDING WITHOUT LIMITATION:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Loss of profits, revenue, data, goodwill, or business opportunities.</li>
              <li>Damages resulting from your reliance on any information obtained from the Platform.</li>
              <li>Damages resulting from unauthorized access to or alteration of your account or data.</li>
              <li>Any other matter relating to the Platform or these Terms.</li>
            </ul>
            <p className="mt-3">
              This limitation applies whether the liability arises in contract, tort (including negligence), statute, or any other legal theory, even if Fact Flow has been advised of the possibility of such damage.
            </p>
          </section>

          {/* 10. Modifications */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Modifications to Terms</h2>
            <p>
              Fact Flow reserves the right to modify, update, or replace these Terms at any time at its sole discretion. When changes are made, we will update the "Last Updated" date at the top of this page and, where appropriate, notify registered users via email or an in-app notification.
            </p>
            <p className="mt-3">
              Your continued access to or use of the Platform after the effective date of any modifications constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must discontinue use of the Platform and may delete your account.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without regard to its conflict of law principles. The following Indian laws are specifically applicable:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The Information Technology Act, 2000 and its amendments</li>
              <li>The Digital Personal Data Protection Act, 2023 (DPDPA)</li>
              <li>The Copyright Act, 1957</li>
              <li>The Consumer Protection Act, 2019</li>
            </ul>
            <p className="mt-3">
              Any dispute, controversy, or claim arising out of or relating to these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the competent courts located in <strong className="text-foreground">India</strong>. You hereby irrevocably consent to the personal jurisdiction of such courts.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Contact Us</h2>
            <p>
              For any questions, concerns, or legal notices regarding these Terms of Use, please contact our legal team:
            </p>
            <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-5 space-y-1">
              <p><span className="text-foreground font-semibold">Platform:</span> Fact Flow</p>
              <p><span className="text-foreground font-semibold">Website:</span> factflow.com</p>
              <p><span className="text-foreground font-semibold">Email:</span>{" "}
                <a href="mailto:factflow1819@gmail.com" className="text-red-500 hover:underline">
                  factflow1819@gmail.com
                </a>
              </p>
              <p><span className="text-foreground font-semibold">Jurisdiction:</span> India</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
