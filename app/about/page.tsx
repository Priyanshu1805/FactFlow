import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Fact Flow",
  description: "Learn more about Fact Flow, your daily pulse of global news and digital community.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            About <span className="text-red-500">Fact Flow</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your daily pulse of global news. Fast, accurate, and entertaining — all in one place. We bring the world's most important stories directly to your screen.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-12">
          
          <div className="bg-secondary/30 border border-border p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Fact Flow, our mission is to empower individuals by providing a seamless, intelligent, and comprehensive news aggregation platform. In a world overloaded with information, we cut through the noise to deliver fast, relevant, and diverse news content that matters to you. From breaking political developments and technological advancements to sports and entertainment, we ensure you never miss a beat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary/30 border border-border p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-foreground mb-4">What We Do</h2>
              <p className="text-muted-foreground leading-relaxed">
                We utilize advanced aggregation technology to curate top headlines from reliable sources worldwide. Beyond traditional news, Fact Flow also features a vibrant social layer, allowing users to interact, share ideas, and participate in global conversations in real-time.
              </p>
            </div>
            
            <div className="bg-secondary/30 border border-border p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe that access to accurate information is a fundamental right. Our vision is to build a digital ecosystem where news is not just consumed, but actively discussed and analyzed by a passionate community of global citizens.
              </p>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Join the Conversation</h2>
            <p className="text-muted-foreground mb-6">
              Become a part of the Fact Flow community today. Stay informed, stay connected.
            </p>
            <a 
              href="/#trending" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Explore Trending News
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
