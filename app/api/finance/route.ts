import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolsParam = searchParams.get("symbols")

  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 })
  }

  const symbols = symbolsParam.split(",").map(s => s.trim())

  try {
    // We use Yahoo Finance's v8 chart endpoint which does NOT require a crumb/token (no 401 errors)
    const promises = symbols.map(async (sym) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          "Accept": "application/json"
        },
        next: { revalidate: 60 } // cache 60s
      })
      
      if (!res.ok) return null
      
      const data = await res.json()
      if (!data.chart || !data.chart.result || !data.chart.result[0]) return null
      
      const meta = data.chart.result[0].meta
      const price = meta.regularMarketPrice
      const prevClose = meta.chartPreviousClose
      const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
      
      return {
        symbol: meta.symbol,
        price: price,
        changePercent: changePercent,
        high: meta.regularMarketDayHigh || price,
        low: meta.regularMarketDayLow || price,
        marketCap: 0
      }
    })

    const resultsRaw = await Promise.all(promises)
    const results = resultsRaw.filter(Boolean)

    if (results.length === 0) {
      throw new Error("Failed to fetch any valid data from Yahoo v8")
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Finance API Proxy Error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
