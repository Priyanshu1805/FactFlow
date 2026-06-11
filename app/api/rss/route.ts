import { NextRequest, NextResponse } from "next/server"
import Parser from "rss-parser"

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "enclosure"],
  },
})

async function translateText(text: string) {
  if (!text) return text;
  // Fast path for ASCII (English)
  if (/^[\x00-\x7F]*$/.test(text)) return text;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map((x: any) => x[0]).join('');
  } catch {
    // Return null if translation fails so we can filter it out
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 })
  }

  try {
    const feed = await parser.parseURL(url)
    
    // We process up to 15 items to avoid translation rate limits
    const rawItems = feed.items.slice(0, 15).map((item: any) => ({
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

    // Translate items sequentially to avoid Google Translate rate limits
    const items = [];
    for (const item of rawItems) {
      const translatedTitle = await translateText(item.title);
      // Skip item completely if title translation fails
      if (translatedTitle === null) continue;

      const translatedSnippet = await translateText(item.contentSnippet);
      // Skip item completely if snippet translation fails
      if (translatedSnippet === null) continue;

      const translatedSource = await translateText(item.source);

      item.title = translatedTitle;
      item.contentSnippet = translatedSnippet;
      item.description = translatedSnippet;
      item.source = translatedSource || item.source; // Fallback to original source if source fails
      
      items.push(item);
    }

    return NextResponse.json({ items, feedTitle: await translateText(feed.title || "") }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, items: [] }, { status: 200 })
  }
}
