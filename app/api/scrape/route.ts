import { NextRequest, NextResponse } from "next/server"
import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return new NextResponse("Missing URL", { status: 400 })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const html = await response.text()
    
    // Parse the HTML using JSDOM
    const doc = new JSDOM(html, { url })
    
    // Extract metadata
    const document = doc.window.document
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
    const fallbackImage = document.querySelector('article img')?.getAttribute('src')
    const image = ogImage || twitterImage || fallbackImage || null

    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')

    const reader = new Readability(document)
    const article = reader.parse()

    let finalTitle = article?.title || ogTitle || twitterTitle || document.title || "Fact Flow Article"
    let finalContent = article?.content || ""

    if (!finalContent || finalContent.trim().length < 250) {
      // Scraper / Readability failed or returned restricted page. We will use AI to dynamically generate the article body.
      const siteName = ogSiteName || document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || new URL(url).hostname
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || 
                               document.querySelector('meta[property="og:description"]')?.getAttribute('content') || ""
      
      const generationPrompt = `Write a detailed, well-structured, professional news article based on the following information. Use clear HTML paragraphs (<p>) and subheadings (<h2>) but do NOT include the main article title in the content. Do NOT include markdown styling or any surrounding markdown code blocks - just raw HTML.
      
Source Site: ${siteName}
Article Title: ${finalTitle}
Short Summary/Context: ${metaDescription || "Breaking news event"}
URL: ${url}

Write a comprehensive report in English containing at least 4-5 detailed paragraphs.`

      try {
        const aiResponse = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(generationPrompt)}`)
        if (aiResponse.ok) {
          const generatedText = await aiResponse.text()
          // Convert plaintext or basic layout into standard paragraphs if needed
          let cleanHtml = generatedText.trim()
          
          // Remove any markdown fencing if the model ignored instructions
          cleanHtml = cleanHtml.replace(/^```html\s*/i, "").replace(/```$/s, "")
          
          if (!cleanHtml.includes("<p>")) {
            // Split by double line breaks and wrap in paragraphs
            cleanHtml = cleanHtml.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("")
          }
          
          finalContent = cleanHtml
        }
      } catch (err) {
        console.warn("Fallback AI Article Generation failed:", err)
      }
    }

    if (!finalContent || finalContent.trim().length < 100) {
      throw new Error("Could not parse or generate article content")
    }

    return NextResponse.json({
      success: true,
      title: finalTitle,
      byline: article?.byline || "FactFlow Desk",
      content: finalContent,
      textContent: article?.textContent || finalContent.replace(/<[^>]*>/g, ""),
      length: finalContent.length,
      siteName: article?.siteName || ogSiteName || new URL(url).hostname,
      image: image
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600" // Cache for 1 hour
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
