import { Metadata } from "next"

export const metadata: Metadata = {
  title: "External Linking Policy | Fact Flow",
  description: "Fact Flow's approach to outbound and external links.",
}

export default function ExternalLinkingPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Approach to External Linking</h1>
          <p className="text-muted-foreground text-sm">
            <strong>Effective Date:</strong> June 1, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> June 10, 2026
          </p>
        </div>

        {/* Intro */}
        <div className="bg-secondary/40 border border-border rounded-2xl p-6 mb-12">
          <p className="text-foreground leading-relaxed">
            At Fact Flow, we believe in the open web. Linking to external sources is fundamental to how we report the news, provide context, and cite original reporting. This page explains our policy on outbound links.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* 1. Why We Link */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Why We Link Externally</h2>
            <p>We include hyperlinks to other websites for several reasons:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-foreground">Source Attribution:</strong> To give proper credit to original publishers, journalists, and primary sources of information.</li>
              <li><strong className="text-foreground">Added Context:</strong> To provide you with background information, deeper analysis, or official documents related to a news story.</li>
              <li><strong className="text-foreground">Fact-Checking:</strong> To link to official government portals, academic studies, or data sets that verify the claims made in an article.</li>
            </ul>
          </section>

          {/* 2. Our Linking Standards */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Our Linking Standards</h2>
            <p>We do not link to just any website. Our editorial team follows these standards:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>We prioritize links to credible, reputable, and authoritative sources.</li>
              <li>We avoid linking to sites known for spreading misinformation, malware, or hate speech.</li>
              <li>Links must be highly relevant to the context of the article.</li>
            </ul>
          </section>

          {/* 3. No Endorsement */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. No Endorsement</h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 mb-4 mt-2">
              <p className="text-red-500 font-bold text-sm">A link is not an endorsement.</p>
            </div>
            <p>
              The inclusion of an external link on Fact Flow does not imply that we endorse, support, or agree with the views, opinions, or content presented on that external website. We link to external sites purely for informational purposes.
            </p>
          </section>

          {/* 4. No Responsibility */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. No Responsibility for External Sites</h2>
            <p>
              Once you click on an external link and leave the Fact Flow platform, you are subject to the policies of that new site.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Fact Flow has no control over the content, privacy practices, or security of external websites.</li>
              <li>We are not responsible for any changes made to the external page after we linked to it.</li>
              <li>We cannot be held liable for any damages or losses incurred from visiting an external site.</li>
            </ul>
          </section>

          {/* 5. Affiliate & Sponsored Links */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Affiliate & Sponsored Links</h2>
            <p>
              Fact Flow may occasionally use affiliate links or publish sponsored content. 
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>If a link is an affiliate link (meaning we may earn a small commission if you purchase through it), it will be clearly disclosed within the article.</li>
              <li>Sponsored articles containing external links are clearly marked with a "Sponsored" or "Ad" badge.</li>
              <li>Our editorial integrity is never compromised by affiliate partnerships.</li>
            </ul>
          </section>

          {/* 6. Broken Links */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Reporting Broken or Inappropriate Links</h2>
            <p>
              The internet is constantly changing, and external pages may be deleted or altered. If you find a broken link, a dead page (404 error), or a link that now redirects to inappropriate content, please let us know so we can fix or remove it.
            </p>
            <p className="mt-2">
              You can report bad links by emailing: <a href="mailto:legal@factflow.com" className="text-red-500 hover:underline">legal@factflow.com</a> (Please include the URL of the Fact Flow article).
            </p>
          </section>

          {/* 7. Link to Us */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Linking to Fact Flow</h2>
            <p>We welcome other websites, blogs, and social media users to link to Fact Flow's original content! However, we ask that you adhere to these guidelines:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Do not frame our content (e.g., displaying our site within an iframe on your site).</li>
              <li>Do not imply that Fact Flow endorses your website or products.</li>
              <li>Do not use the Fact Flow logo without our written permission.</li>
              <li>You may link directly to individual articles, categories, or our homepage.</li>
            </ul>
          </section>

          {/* 8. Contact */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Contact Us</h2>
            <p>If you have any legal concerns regarding an external link, please contact our legal team:</p>
            <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-5">
              <p><span className="text-foreground font-semibold">Email:</span>{" "}
                <a href="mailto:legal@factflow.com" className="text-red-500 hover:underline">legal@factflow.com</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
