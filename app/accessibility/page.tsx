import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Help | Fact Flow",
  description: "Learn about the accessibility features available on Fact Flow and how to use them.",
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Accessibility Help</h1>
          <p className="text-muted-foreground text-lg">
            Making news accessible to everyone.
          </p>
        </div>

        {/* 1. Our Commitment */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-12">
          <h2 className="text-xl font-bold text-foreground mb-2">Our Commitment</h2>
          <p className="text-muted-foreground leading-relaxed">
            At Fact Flow, we believe that access to information is a fundamental right. We are fully committed to ensuring our platform is welcoming, easy to use, and accessible to all users, regardless of ability or the technology they use.
          </p>
        </div>

        <div className="space-y-12">
          {/* 2. Features on Our Site */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="bg-secondary p-2 rounded-lg">✨</span> Features Built for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "⌨️", title: "Keyboard Navigation", desc: "Navigate the entire website using just your keyboard (Tab, Enter, arrows)." },
                { icon: "🗣️", title: "Screen Reader Support", desc: "Images have alt-text and buttons have ARIA labels for screen readers like NVDA and VoiceOver." },
                { icon: "🌗", title: "High Contrast Mode", desc: "Switch to Dark Mode for reduced eye strain and higher contrast reading." },
                { icon: "🔊", title: "Audio News (TTS)", desc: "Listen to articles instead of reading them using our built-in Text-to-Speech player." },
              ].map((feat) => (
                <div key={feat.title} className="bg-card border border-border p-5 rounded-xl">
                  <div className="text-2xl mb-3 font-bold">{feat.icon}</div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. How to Enable Features */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-5">How to Enable These Features</h2>
            <div className="space-y-4">
              <div className="bg-secondary/30 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-2">High Contrast / Dark Mode</h4>
                <p className="text-muted-foreground text-sm">Click the Moon/Sun icon in the main navigation bar at the top right to instantly switch between light and dark themes.</p>
              </div>
              <div className="bg-secondary/30 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-2">Listening to Articles</h4>
                <p className="text-muted-foreground text-sm">Look for the "Play Audio" button at the top of an article to hear it read aloud. You can adjust the playback speed in the audio player.</p>
              </div>
            </div>
          </section>

          {/* 4. Browser Accessibility Settings */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-5">Browser Settings</h2>
            <p className="text-muted-foreground mb-4">You can also use your web browser's built-in tools to make reading easier:</p>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li><strong>To Zoom In:</strong> Press <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">Ctrl</kbd> (or <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">Cmd</kbd> on Mac) and the <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">+</kbd> key.</li>
              <li><strong>To Zoom Out:</strong> Press <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">Ctrl</kbd> (or <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">Cmd</kbd> on Mac) and the <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">-</kbd> key.</li>
              <li><strong>Reset Zoom:</strong> Press <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-secondary rounded border border-border text-xs">0</kbd>.</li>
            </ul>
          </section>

          {/* 5. Limitations & Third-Party Content */}
          <section className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Known Limitations</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                While we strive for perfect accessibility, there may be some current gaps, such as older articles missing audio versions or complex charts that are difficult for screen readers to interpret. We are actively working to fix these issues.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Third-Party Content</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Fact Flow often embeds content from other sources (like YouTube videos or social media posts). Unfortunately, we cannot always guarantee that these external embeds will be fully accessible or have captions.
              </p>
            </div>
          </section>

          {/* 6. Feedback */}
          <section className="bg-secondary/50 border border-border p-8 rounded-2xl text-center mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-3">We Want Your Feedback</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Did you find something difficult to use? Have a suggestion on how we can improve? We are always listening. Please report any accessibility issues to our team.
            </p>
            <div className="inline-block bg-background border border-border px-6 py-3 rounded-xl font-medium">
              Email us at: <a href="mailto:factflow1819@gmail.com" className="text-red-500 hover:underline">factflow1819@gmail.com</a>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
