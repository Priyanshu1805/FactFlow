import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'delhi';
  const metal = searchParams.get('metal') || 'gold'; // gold or silver

  let simpleCity = city.toLowerCase().replace(/[^a-z\s]/g, '').trim();

  try {
    // Determine the Yahoo Finance symbol
    const symbol = metal === 'gold' ? 'GC=F' : 'SI=F';
    
    // Fetch directly from Yahoo Finance v8 API to avoid local proxy loop
    const fetchYahoo = async (sym: string) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        },
        next: { revalidate: 60 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    };

    const [spotUSD, usdInr] = await Promise.all([
      fetchYahoo(symbol),
      fetchYahoo('INR=X')
    ]);

    if (!spotUSD || !usdInr) throw new Error("Missing price data from Yahoo API");

    // Conversion logic:
    // 1 Troy Ounce = 31.1034768 grams
    // Gold Price: Calculate INR per 10 grams
    // Silver Price: Calculate INR per 1000 grams (1 kg)
    // Plus ~15% Indian import duty & GST to match physical market rates.
    let basePriceINR = 0;
    if (metal === 'gold') {
      basePriceINR = (spotUSD / 31.1034768) * 10 * usdInr * 1.15;
    } else {
      basePriceINR = (spotUSD / 31.1034768) * 1000 * usdInr * 1.15;
    }

    // City-wise variations (simulating local taxes and premiums)
    // Percentage offset from base price
    const cityOffsets: Record<string, number> = {
      mumbai: 0.001,      // +0.1%
      'new-delhi': 0.003, // +0.3%
      delhi: 0.003,
      chennai: 0.008,     // +0.8% (usually higher)
      kolkata: 0.001,
      bengaluru: 0.005,
      hyderabad: 0.008,
      ahmedabad: 0.002,
      nagpur: 0.001
    };

    const key = simpleCity.replace(/\s+/g, '');
    const offset = cityOffsets[key] !== undefined ? cityOffsets[key] : 0.002; // default +0.2%
    
    const finalPrice = Math.round(basePriceINR * (1 + offset));

    return NextResponse.json({
      success: true,
      city: city,
      metal: metal,
      price: finalPrice,
      currency: "INR",
      unit: metal === 'gold' ? "10g" : "1kg"
    });

  } catch (error: any) {
    console.error("Metal Calculation Error:", error.message);
    
    // Fallback to static realistic rates if API goes down
    const fallbackPrice = metal === 'gold' ? 73500 : 86500;
    return NextResponse.json({
      success: false,
      city: city,
      metal: metal,
      price: fallbackPrice,
      currency: "INR",
      unit: metal === 'gold' ? "10g" : "1kg",
      isFallback: true
    });
  }
}
