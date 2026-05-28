"use client"

import { SocialFeedPage } from "@/components/frontend/social/social-feed-page"
import { useTheme } from "@/components/theme-provider"
import { StoryViewer } from "@/components/frontend/stories/story-viewer"
import { useState, Suspense } from "react"
import { PageShell } from "@/components/frontend/page-shell"

export default function SocialPage() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [activeStoryGroup, setActiveStoryGroup] = useState<any[] | null>(null)
  const [storyIndex, setStoryIndex] = useState(0)

  return (
    <PageShell className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`}>
      <main className="pt-16">
        <Suspense fallback={
          <div className="flex justify-center items-center h-96">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SocialFeedPage
            isDark={isDark}
            onStoryClick={(group: any, index: number) => {
              setActiveStoryGroup(group)
              setStoryIndex(index)
            }}
          />
        </Suspense>
      </main>

      {activeStoryGroup && (
        <StoryViewer
          groupedStories={activeStoryGroup}
          initialGroupIndex={storyIndex}
          onClose={() => setActiveStoryGroup(null)}
        />
      )}
    </PageShell>
  )
}
