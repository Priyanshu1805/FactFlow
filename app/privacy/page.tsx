import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Fact Flow",
  description: "Fact Flow Privacy Policy — compliant with India's DPDPA 2023 and IT Act 2000.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            <strong>Effective Date:</strong> June 1, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> June 10, 2026
          </p>
        </div>

        {/* Compliance Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 mb-10">
          <p className="text-sm font-semibold text-red-500">
            This Privacy Policy is compliant with India's Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act, 2000. By using Fact Flow, you consent to the practices described herein.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p>
              Fact Flow ("we", "us", "our", or "Company") operates the digital news platform accessible at <strong className="text-foreground">factflow.com</strong> and its associated mobile applications (collectively, the "Platform"). We are committed to protecting your personal data and respecting your privacy.
            </p>
            <p className="mt-3">
              This Privacy Policy ("Policy") explains what personal information we collect, why we collect it, how we use and share it, and the rights you have over your data. This Policy applies to all users ("you", "your", or "Data Principal") who access or use the Platform, whether as a guest, registered user, or paid subscriber.
            </p>
            <p className="mt-3">
              This Policy is published in compliance with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The <strong className="text-foreground">Digital Personal Data Protection Act, 2023 (DPDPA)</strong></li>
              <li>The <strong className="text-foreground">Information Technology Act, 2000</strong> and the IT (Reasonable Security Practices) Rules, 2011</li>
              <li>The <strong className="text-foreground">Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong></li>
            </ul>
            <p className="mt-3">
              If you do not agree with this Policy, please discontinue use of the Platform.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p>We collect personal data in the following categories:</p>

            <p className="font-semibold text-foreground mt-4 mb-2">2.1 Information You Provide Directly</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Account Registration:</strong> Full name, email address, phone number (optional), and profile picture when you sign up.</li>
              <li><strong className="text-foreground">Payment Information:</strong> Billing details (processed securely via Razorpay; we do not store card numbers).</li>
              <li><strong className="text-foreground">User Content:</strong> Comments, ideas, posts, and messages you submit on the Platform.</li>
              <li><strong className="text-foreground">Support Requests:</strong> Information you share when contacting us.</li>
            </ul>

            <p className="font-semibold text-foreground mt-4 mb-2">2.2 Information Collected Automatically</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Device Information:</strong> Browser type, operating system, device type, screen resolution, and unique device identifiers.</li>
              <li><strong className="text-foreground">IP Address:</strong> Automatically collected for security, fraud prevention, and regional content delivery.</li>
              <li><strong className="text-foreground">Browsing Behavior:</strong> Pages visited, articles read, time spent on articles, scroll depth, clicks, and interactions within the Platform.</li>
              <li><strong className="text-foreground">Location Data:</strong> Approximate location derived from IP address or, if you explicitly select a preferred region, the region you specify.</li>
              <li><strong className="text-foreground">Referral Data:</strong> The website or search engine that directed you to the Platform.</li>
            </ul>

            <p className="font-semibold text-foreground mt-4 mb-2">2.3 Information from Third Parties</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Social Login:</strong> If you sign in via Google or another OAuth provider, we receive your name, email address, and profile picture as permitted by that provider.</li>
              <li><strong className="text-foreground">Analytics Providers:</strong> Aggregated and anonymized usage data from analytics services.</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Personalization:</strong> To curate and customize your news feed based on your selected topics, reading history, language preferences, and region.</li>
              <li><strong className="text-foreground">Notifications:</strong> To send you breaking news alerts, daily/weekly digest emails, and in-app push notifications (based on your notification settings).</li>
              <li><strong className="text-foreground">Account Management:</strong> To create, maintain, and manage your user account and subscription.</li>
              <li><strong className="text-foreground">Platform Improvement:</strong> To analyze usage patterns, diagnose technical issues, conduct A/B testing, and improve the overall user experience.</li>
              <li><strong className="text-foreground">Analytics:</strong> To understand aggregate user behavior, measure content performance, and generate internal reports.</li>
              <li><strong className="text-foreground">Security & Fraud Prevention:</strong> To detect, investigate, and prevent unauthorized access, fraud, and abuse of the Platform.</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> To comply with applicable laws, respond to court orders, or enforce our Terms of Use.</li>
              <li><strong className="text-foreground">Communications:</strong> To send transactional emails (account verification, password reset, payment receipts) and, where you have opted in, marketing communications.</li>
            </ul>
          </section>

          {/* 4. Legal Basis */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Legal Basis for Processing</h2>
            <p>
              Under the <strong className="text-foreground">Digital Personal Data Protection Act, 2023 (DPDPA)</strong>, we process your personal data only when a valid legal basis exists. Our primary legal bases are:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-foreground">Consent (Section 6, DPDPA):</strong> For non-essential data processing such as analytics cookies, personalized advertising, and marketing emails, we rely on your explicit, informed, and voluntary consent. You may withdraw this consent at any time without affecting the lawfulness of prior processing.
              </li>
              <li>
                <strong className="text-foreground">Legitimate Uses (Section 7, DPDPA):</strong> For processing necessary to provide the services you have requested, fulfill contractual obligations (e.g., processing your subscription payment), comply with legal obligations, or protect vital interests.
              </li>
            </ul>
            <p className="mt-3">
              Where we rely on consent, we will present you with a clear and specific consent request. Withdrawal of consent will not affect the lawfulness of processing carried out before the withdrawal.
            </p>
          </section>

          {/* 5. Cookies & Tracking */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Cookies & Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies (web beacons, pixels, local storage) on the Platform. In compliance with the DPDPA 2023, we obtain your opt-in consent before placing any non-essential cookies.
            </p>
            <div className="mt-4 space-y-4">
              <div className="bg-secondary/40 border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground mb-1">Essential Cookies <span className="text-xs font-normal text-green-500 ml-1">(Always Active)</span></p>
                <p>Required for the Platform to function. They manage session authentication, security tokens, and basic preferences. These cannot be disabled without breaking core functionality.</p>
              </div>
              <div className="bg-secondary/40 border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground mb-1">Preference Cookies <span className="text-xs font-normal text-yellow-500 ml-1">(Opt-In Required)</span></p>
                <p>Remember your settings such as language, region, theme (dark/light mode), and font size. Disabling these means your preferences will reset on each visit.</p>
              </div>
              <div className="bg-secondary/40 border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground mb-1">Analytics Cookies <span className="text-xs font-normal text-yellow-500 ml-1">(Opt-In Required)</span></p>
                <p>Help us understand how users interact with the Platform (e.g., Google Analytics, Firebase). All data is aggregated and anonymized. We use this to improve our content and performance.</p>
              </div>
            </div>
            <p className="mt-4">
              You can manage your cookie preferences at any time through your browser settings or from the cookie consent banner displayed on your first visit. Note that restricting essential cookies may affect Platform functionality. For full details, please see our <a href="/cookies" className="text-red-500 hover:underline">Cookie Policy</a>.
            </p>
          </section>

          {/* 6. Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Data Sharing</h2>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 mb-4">
              <p className="text-green-500 font-bold text-sm">🔒 We do NOT sell, rent, or trade your personal data to any third party for their own commercial purposes.</p>
            </div>
            <p>We may share your data only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-foreground">Service Providers:</strong> We engage trusted third-party vendors (e.g., cloud hosting — MongoDB Atlas, Cloudinary; payment processing — Razorpay; email delivery — Gmail SMTP; analytics — Firebase/Google Analytics) who process data solely on our behalf under strict data processing agreements that prohibit unauthorized use.
              </li>
              <li>
                <strong className="text-foreground">Legal Requirements:</strong> We may disclose your data to government authorities, courts, or law enforcement agencies when required by applicable law, a court order, or government regulation, including under the IT Act 2000 and DPDPA 2023.
              </li>
              <li>
                <strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity, subject to the same privacy protections.
              </li>
              <li>
                <strong className="text-foreground">With Your Consent:</strong> In any other circumstance, only with your prior explicit consent.
              </li>
            </ul>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to fulfill the purposes described in this Policy:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Account Data:</strong> Retained for the duration of your account's existence plus 90 days after deletion to allow for account recovery. After 90 days, it is permanently deleted.</li>
              <li><strong className="text-foreground">Transaction & Payment Records:</strong> Retained for 7 years to comply with financial and tax regulations under Indian law.</li>
              <li><strong className="text-foreground">Browsing & Usage Logs:</strong> Retained for up to 12 months in identifiable form, then anonymized or deleted.</li>
              <li><strong className="text-foreground">Support Communications:</strong> Retained for 2 years from the date of resolution.</li>
              <li><strong className="text-foreground">User Content (Comments, Posts):</strong> Retained until you delete them or your account is deleted, whichever comes first.</li>
            </ul>
            <p className="mt-3">When data is no longer required, it is securely deleted or anonymized using industry-standard methods.</p>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Your Rights as a Data Principal</h2>
            <p>
              Under the <strong className="text-foreground">DPDPA 2023</strong>, you have the following rights with respect to your personal data:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Right to Access (Section 11):</strong> Request a summary of the personal data we hold about you and the processing activities carried out.</li>
              <li><strong className="text-foreground">Right to Correction (Section 12):</strong> Request correction of inaccurate or incomplete personal data.</li>
              <li><strong className="text-foreground">Right to Erasure (Section 12):</strong> Request deletion of your personal data when it is no longer necessary for the purposes it was collected, subject to legal retention requirements.</li>
              <li><strong className="text-foreground">Right to Withdraw Consent (Section 6):</strong> Withdraw your consent for any non-essential data processing at any time. Withdrawal does not affect the lawfulness of prior processing.</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Request your personal data in a structured, commonly used, machine-readable format to transfer to another service provider.</li>
              <li><strong className="text-foreground">Right to Grievance Redressal (Section 13):</strong> File a complaint with our Grievance Officer (see Section 13). If unsatisfied, you may escalate to the <strong>Data Protection Board of India</strong>.</li>
              <li><strong className="text-foreground">Right to Nominate:</strong> Nominate an individual to exercise rights on your behalf in the event of death or incapacity.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact our Grievance Officer at <strong className="text-red-500">factflow1819@gmail.com</strong>. We will respond within <strong className="text-foreground">30 days</strong> of receiving your request.
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Children's Privacy</h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 mb-4">
              <p className="text-red-500 font-semibold text-sm">The Platform is not intended for children under the age of 13.</p>
            </div>
            <p>
              We do not knowingly collect or solicit personal data from children under the age of 13 years. In compliance with the DPDPA 2023, processing of personal data of children requires verifiable parental consent.
            </p>
            <p className="mt-3">
              If we become aware that we have inadvertently collected personal data from a child under 13 without appropriate consent, we will take immediate steps to delete such data from our records. If you believe that we may have collected data from a child under 13, please contact us immediately at <strong className="text-red-500">factflow1819@gmail.com</strong>.
            </p>
          </section>

          {/* 10. Data Security */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Data Security</h2>
            <p>
              We implement industry-standard technical, administrative, and physical safeguards to protect your personal data from unauthorized access, disclosure, alteration, or destruction, in accordance with Rule 8 of the IT (Reasonable Security Practices and Procedures) Rules, 2011:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL (HTTPS). Sensitive data at rest is encrypted using AES-256 encryption.</li>
              <li><strong className="text-foreground">Access Controls:</strong> Access to personal data is strictly limited to authorized personnel on a need-to-know basis.</li>
              <li><strong className="text-foreground">Secure Infrastructure:</strong> We host our data on MongoDB Atlas (ISO 27001 certified), with automated backups and failover protection.</li>
              <li><strong className="text-foreground">Authentication:</strong> We use Firebase Authentication with secure token management, and encourage users to enable strong passwords.</li>
              <li><strong className="text-foreground">Regular Audits:</strong> We conduct periodic security reviews and vulnerability assessments of our systems.</li>
            </ul>
            <p className="mt-3">
              <strong className="text-foreground">Breach Notification:</strong> In the event of a personal data breach that is likely to result in risk to your rights, we will notify you and the relevant authorities (the Data Protection Board of India, once operational) without undue delay, and in no case later than <strong className="text-foreground">72 hours</strong> of becoming aware of the breach, as required by applicable law.
            </p>
            <p className="mt-3">
              While we implement these safeguards, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* 11. Third-Party Links */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Third-Party Links</h2>
            <p>
              The Platform aggregates and links to content from third-party news publishers, websites, and platforms. When you click on an external link, you leave the Fact Flow Platform and are subject to the privacy policies and terms of that third-party website.
            </p>
            <p className="mt-3">
              Fact Flow has no control over, and assumes no responsibility for, the content, privacy policies, or data practices of any third-party sites or services. We encourage you to read the privacy policy of every website you visit.
            </p>
          </section>

          {/* 12. Changes to Policy */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our data practices, legal requirements, or the features of the Platform. When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Update the "Last Updated" date at the top of this page.</li>
              <li>Send a notification to registered users via email or an in-app banner, giving you at least <strong className="text-foreground">15 days' advance notice</strong> before the changes take effect.</li>
            </ul>
            <p className="mt-3">
              For minor changes that do not materially affect your rights, we may update the Policy without individual notification but will always update the "Last Updated" date. Your continued use of the Platform after the effective date of any revised Policy constitutes your acceptance of the changes.
            </p>
          </section>

          {/* 13. Grievance Officer */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">13. Contact & Grievance Officer</h2>
            <p>
              In accordance with <strong className="text-foreground">Section 13 of the DPDPA 2023</strong> and Rule 5(9) of the IT (Intermediary Guidelines) Rules, 2021, we have appointed a Grievance Officer to address any concerns regarding the processing of your personal data.
            </p>
            <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-5 space-y-2">
              <p className="font-bold text-foreground text-base mb-3">Grievance Officer — Fact Flow</p>
              <p><span className="text-foreground font-semibold">Platform:</span> Fact Flow (factflow.com)</p>
              <p><span className="text-foreground font-semibold">Email:</span>{" "}
                <a href="mailto:factflow1819@gmail.com" className="text-red-500 hover:underline">
                  factflow1819@gmail.com
                </a>
              </p>
              <p><span className="text-foreground font-semibold">Subject Line:</span> "Privacy Grievance — [Your Name]"</p>
              <p><span className="text-foreground font-semibold">Response Time:</span> We will acknowledge your complaint within <strong>48 hours</strong> and endeavour to resolve it within <strong>30 days</strong> of receipt.</p>
              <p><span className="text-foreground font-semibold">Jurisdiction:</span> India</p>
            </div>
            <p className="mt-4">
              If you are not satisfied with our response, you have the right to escalate your complaint to the <strong className="text-foreground">Data Protection Board of India</strong> once it becomes operational under the DPDPA 2023.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
