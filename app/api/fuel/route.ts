import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'delhi';

  let price = 104.21; // National average fallback

  try {
    // Clean up city name
    let simpleCity = city.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (simpleCity.includes('mumbai')) simpleCity = 'mumbai';
    else if (simpleCity.includes('delhi')) simpleCity = 'new-delhi';
    else if (simpleCity.includes('bangalore') || simpleCity.includes('bengaluru')) simpleCity = 'bengaluru';
    else if (simpleCity.includes('chennai')) simpleCity = 'chennai';
    else if (simpleCity.includes('kolkata')) simpleCity = 'kolkata';
    else simpleCity = simpleCity.split(' ')[0];

    const url = `https://www.ndtv.com/fuel-prices/petrol-price-in-${simpleCity}-city`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      next: { revalidate: 3600 }
    });

    const cityFallbacks: Record<string, number> = {
      mumbai: 115.5,
      delhi: 104.2,
      'new-delhi': 104.2,
      chennai: 106.3,
      kolkata: 102.8,
      bengaluru: 108.9,
      hyderabad: 109.4,
      pune: 111.0,
      ahmedabad: 103.5,
      nagpur: 107.2,
      // Additional major cities
      lucknow: 103.0,
      jaipur: 104.5,
      bhopal: 103.8,
      indore: 105.2,
      bhubaneswar: 106.0,
      kochi: 112.5,
      chandigarh: 108.0,
      surat: 114.0,
      rajkot: 106.5,
      varanasi: 103.6,
      amritsar: 108.3,
      agra: 105.0,
      patna: 104.9,
      ludhiana: 106.8,
      kanpur: 103.2,
      goa: 113.0,
      mysore: 110.5,
      aurangabad: 108.7,
      jabalpur: 104.3
    };

    if (response.ok) {
      const html = await response.text();
      const match = html.match(/<td>([0-9]{2,3}\.[0-9]{2})\s*₹\/L<\/td>/);
      if (match && match[1]) {
        price = parseFloat(match[1]);
      } else {
        // No price found, try fallback map
        const key = simpleCity.replace(/\s+/g, '');
        if (cityFallbacks[key] !== undefined) price = cityFallbacks[key];
      }
    } else {
      // Response not ok, use fallback map
      const key = simpleCity.replace(/\s+/g, '');
      if (cityFallbacks[key] !== undefined) price = cityFallbacks[key];
    }
  } catch (error: any) {
    console.error("Fuel Scraper Error:", error.message);
  }

  // Always return success so the widget doesn't fall back to rapid oscillating fake data
  return NextResponse.json({
    success: true,
    city: city,
    price: price,
    currency: "INR",
    unit: "L",
    isFallback: price === 104.21
  });
}
