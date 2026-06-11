import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, { cache: "no-store" });
    const weatherData = await weatherRes.json();

    let aqi = 50; // default safe value
    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`;
      const aqiRes = await fetch(aqiUrl, { cache: "no-store" });
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        if (aqiData?.current?.us_aqi) {
          aqi = aqiData.current.us_aqi;
        }
      }
    } catch (e) {
      console.error("AQI Fetch Error:", e);
    }

    return NextResponse.json({
      success: true,
      weather: weatherData,
      aqi
    });
  } catch (error: any) {
    console.error("Weather API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
