export interface RSSItem {
  id: string
  title: string
  link: string
  source: string
  author?: string
  summary: string
  image: string
  country: string
  language: string
  category: string
  published: Date
}

export async function fetchRSS(url: string, country: string, language: string): Promise<RSSItem[]> {
  const proxyUrl = `/api/rss?url=${encodeURIComponent(url)}`
  try {
    const res = await fetch(proxyUrl)
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map((item: any, idx: number) => ({
      id: `${country}-${language}-${idx}-${Date.now()}`,
      title: item.title || "",
      link: item.link || "",
      source: item.source || item.feed?.title || "",
      summary: item.contentSnippet || item.description || "",
      image: item.image?.url || item.enclosure?.url || "",
      country,
      language,
      category: item.categories?.[0] || "General",
      published: new Date(item.pubDate || Date.now()),
    }))
  } catch {
    return []
  }
}
