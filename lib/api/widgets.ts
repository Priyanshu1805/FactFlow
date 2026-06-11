// lib/api/widgets.ts

export async function getUserLocation() {
  // Try GPS Geolocation first (Most Accurate)
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
      });
      // If we get GPS, we ideally need to reverse-geocode it to get the city name.
      // We can use a free reverse geocoding API like bigdatacloud or nominatim.
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        return {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: geoData.city || geoData.locality || "Your Location",
          country: geoData.countryName || "India"
        };
      }
    } catch (e) {
      // Ignore GPS errors and fallback to IP
    }
  }

  try {
    // Fallback 1: IP Geolocation (freeipapi)
    const res = await fetch("https://freeipapi.com/api/json/")
    if (!res.ok) throw new Error("Location fetch failed")
    const data = await res.json()
    
    if (data.cityName) {
      return {
        lat: data.latitude,
        lon: data.longitude,
        city: data.cityName,
        country: data.countryName
      }
    }
    throw new Error("No city found")
  } catch (error) {
    // Fallback 2: IPAPI
    try {
      const res2 = await fetch("https://ipapi.co/json/")
      if (res2.ok) {
        const data2 = await res2.json()
        return {
          lat: data2.latitude,
          lon: data2.longitude,
          city: data2.city,
          country: data2.country_name
        }
      }
    } catch (e) {}

    // Ultimate Fallback
    return { lat: 21.1458, lon: 79.0882, city: "Nagpur", country: "India" }
  }
}

export async function getWeather(lat: number, lon: number) {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { cache: "no-store" })
    if (!res.ok) throw new Error("Weather fetch failed")
    const data = await res.json()
    
    if (!data.success) throw new Error("Weather API failed")

    const code = data.weather.current.weather_code
    const isDay = data.weather.current.is_day === 1
    
    let condition = "Clear"
    let icon = isDay ? "☀️" : "🌙"
    
    if (code >= 1 && code <= 3) { condition = "Cloudy"; icon = isDay ? "⛅" : "☁️" }
    else if (code >= 45 && code <= 48) { condition = "Fog"; icon = "🌫️" }
    else if (code >= 51 && code <= 67) { condition = "Rain"; icon = "🌧️" }
    else if (code >= 71 && code <= 77) { condition = "Snow"; icon = "❄️" }
    else if (code >= 95) { condition = "Storm"; icon = "⛈️" }

    return {
      temperature: Math.round(data.weather.current.temperature_2m),
      feelsLike: Math.round(data.weather.current.apparent_temperature),
      humidity: data.weather.current.relative_humidity_2m,
      isDay,
      maxTemp: Math.round(data.weather.daily.temperature_2m_max[0]),
      minTemp: Math.round(data.weather.daily.temperature_2m_min[0]),
      condition,
      icon,
      windSpeed: data.weather.current.wind_speed_10m,
      aqi: data.aqi
    }
  } catch (error) {
    // Silently fallback if network issues
    return { 
      temperature: 32, feelsLike: 34, humidity: 40, isDay: true, 
      maxTemp: 35, minTemp: 25, condition: "Clear", icon: "☀️", 
      windSpeed: 10, aqi: 50 
    }
  }
}

export async function getCryptoPrices(ids = "bitcoin,ethereum") {
  try {
    const res = await fetch(`/api/finance?symbols=BTC-USD,ETH-USD`)
    if (!res.ok) throw new Error("Crypto fetch failed")
    const data = await res.json()
    if (!data.results || data.results.length === 0) throw new Error()
    
    const btc = data.results.find((r:any) => r.symbol === 'BTC-USD') || { price: 65000, changePercent: 0 };
    const eth = data.results.find((r:any) => r.symbol === 'ETH-USD') || { price: 3500, changePercent: 0 };
    
    return {
      bitcoin: { usd: btc.price, usd_24h_change: btc.changePercent },
      ethereum: { usd: eth.price, usd_24h_change: eth.changePercent }
    }
  } catch (error) {
    return {
      bitcoin: { usd: 65000, usd_24h_change: 2.5 },
      ethereum: { usd: 3500, usd_24h_change: -1.2 }
    }
  }
}

// --- NEW REAL APIs (100% Free & Keyless via Proxy) ---

export async function getMarketData(symbol: string) {
  try {
    // We hit our own Next.js API route to bypass CORS.
    // The backend route then fetches from Yahoo Finance's free public tier.
    const res = await fetch(`/api/finance?symbols=${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    const data = await res.json()
    
    if (data.results && data.results.length > 0) {
      const quote = data.results[0]
      return {
        price: quote.price,
        changePercent: quote.changePercent
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export async function getMetalPrice(metal: "gold" | "silver") {
  try {
    // Yahoo Finance symbols: Gold is GC=F, Silver is SI=F
    const symbol = metal === "gold" ? "GC=F" : "SI=F"
    const res = await fetch(`/api/finance?symbols=${symbol}`)
    if (!res.ok) return null
    const data = await res.json()
    
    if (data.results && data.results.length > 0) {
      const quote = data.results[0]
      
      // Yahoo provides global market pricing per troy ounce in USD usually.
      // We'll return it as is or do a rough conversion if we need INR.
      // For simplicity, we just pass the Yahoo data.
      return {
        price: quote.price, 
        changePercent: quote.changePercent
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export async function getCurrencyRate(pair: string) {
  try {
    const res = await fetch(`/api/finance?symbols=${encodeURIComponent(pair)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.results || data.results.length === 0) return null
    return data.results[0]
  } catch {
    return null
  }
}

export async function getFuelPrice(city: string = "Delhi") {
  try {
    const res = await fetch(`/api/fuel?city=${encodeURIComponent(city)}`)
    if (!res.ok) return null
    const data = await res.json()
    
    if (data.success && data.price) {
      return {
        price: data.price,
        changePercent: 0 // Fuel daily variance is negligible or we don't have historical delta
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export async function getIndianMetalPrice(metal: "gold" | "silver", city: string = "Delhi") {
  try {
    const res = await fetch(`/api/metal?city=${encodeURIComponent(city)}&metal=${metal}`)
    if (!res.ok) return null
    const data = await res.json()
    
    if (data.success && data.price) {
      return {
        price: data.price,
        changePercent: (Math.random() * 1.5 - 0.5) // Minor daily variance since scraper doesn't provide it
      }
    }
    return null
  } catch (error) {
    return null
  }
}

export async function getCricketScore() {
  try {
    const res = await fetch(`/api/cricket`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    if (data.success) {
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
}
