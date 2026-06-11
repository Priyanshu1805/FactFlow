import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return new NextResponse("Missing URL parameter", { status: 400 })

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
    
    let html = await response.text()
    
    // Inject a base tag so relative links and assets resolve correctly
    try {
      const origin = new URL(url).origin
      html = html.replace('<head>', `<head><base href="${origin}/" target="_blank">`)
      
      // Inject some CSS to hide cookie banners if possible (optional)
      html = html.replace('</head>', `<style>
        #onetrust-consent-sdk, .cookie-banner, .cmp-container { display: none !important; }
        body { font-family: system-ui, -apple-system, sans-serif !important; }
      </style></head>`)
    } catch(e) {}

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // IMPORTANT: We do NOT set X-Frame-Options here, allowing our iframe to embed it!
        "Cache-Control": "public, s-maxage=60"
      }
    })
  } catch (error: any) {
    return new NextResponse(
      `<div style="font-family:sans-serif;padding:40px;text-align:center;color:#333;">
        <h2>Content Could Not Be Loaded</h2>
        <p>The original website is blocking automated access or took too long to respond.</p>
        <a href="${url}" target="_blank" style="color:blue;">Click here to open in a new tab</a>
      </div>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    )
  }
}
