import { Metadata } from "next"

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/news/${params.slug}`)
    if (!res.ok) return { title: "Article Not Found | Fact Flow" }
    
    const data = await res.json()
    if (!data.success || !data.data) return { title: "Article Not Found | Fact Flow" }
    
    const article = data.data

    return {
      title: article.title,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        url: `https://factflow.news/article/${article._id}`,
        type: "article",
        publishedTime: article.publishedAt,
        authors: article.author?.name || "Fact Flow Desk",
        images: article.image || "https://factflow.news/og-image.jpg",
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.excerpt,
        images: article.image || "https://factflow.news/og-image.jpg",
      }
    }
  } catch (error) {
    return {
      title: "Fact Flow News",
      description: "Read the latest news on Fact Flow."
    }
  }
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
