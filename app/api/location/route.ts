import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://freeipapi.com/api/json/", { cache: "no-store" });
    if (!res.ok) throw new Error("Location fetch failed");
    const data = await res.json();
    return NextResponse.json({
      success: true,
      lat: data.latitude,
      lon: data.longitude,
      city: data.cityName,
      country: data.countryName
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      lat: 21.1458,
      lon: 79.0882,
      city: "Nagpur",
      country: "India"
    });
  }
}
