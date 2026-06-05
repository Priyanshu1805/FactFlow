import { NextRequest, NextResponse } from "next/server"
import Parser from "rss-parser"

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "enclosure"],
  },
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 })
  }

  try {
    const feed = await parser.parseURL(url)
    const items = feed.items.map((item: any) => ({
      title: item.title || "",
      link: item.link || item.guid || "",
      description: item.contentSnippet || item.content || item.description || "",
      contentSnippet: item.contentSnippet || "",
      pubDate: item.pubDate || item.isoDate || "",
      author: item.creator || item.author || "",
      categories: item.categories || [],
      source: feed.title || "",
      image:
        item["media:content"]?.["$"]?.url ||
        item["media:thumbnail"]?.["$"]?.url ||
        item.enclosure?.url ||
        (item["content:encoded"] || "").match(/src="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i)?.[1] ||
        "",
    }))

    return NextResponse.json({ items, feedTitle: feed.title }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, items: [] }, { status: 200 })
  }
}
