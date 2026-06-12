import { Request, Response } from "express";
import axios from "axios";
import yahooFinance from "yahoo-finance2";

export const getLiveInfo = async (req: Request, res: Response) => {
  try {
    const { widgets, lat, lon, state, city } = req.body;
    
    if (!widgets || !Array.isArray(widgets)) {
      res.status(400).json({ success: false, message: "Widgets array is required" });
      return;
    }

    const results: Record<string, any> = {};

    // Parallel fetch promises
    const promises = widgets.map(async (widget) => {
      try {
        switch (widget) {
          case "weather":
            if (lat && lon) {
              const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=auto`);
              const aqiRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`);
              
              results.weather = {
                temp: weatherRes.data.current.temperature_2m,
                code: weatherRes.data.current.weather_code,
                wind: weatherRes.data.current.wind_speed_10m,
                aqi: aqiRes.data.current.us_aqi,
                sunrise: weatherRes.data.daily.sunrise[0],
                sunset: weatherRes.data.daily.sunset[0],
                city: city || "Unknown Location"
              };
            } else {
              results.weather = { error: "Location required" };
            }
            break;

          case "finance":
            // Fetch multiple symbols using yahoo-finance2
            const symbols = ["BTC-USD", "GC=F", "^BSESN", "^NSEI", "INR=X"];
            const quotes = await yahooFinance.quote(symbols);
            
            const financeData: Record<string, any> = {};
            (quotes as any[]).forEach((q: any) => {
              financeData[q.symbol] = {
                price: q.regularMarketPrice,
                change: q.regularMarketChangePercent,
                currency: q.currency
              };
            });
            results.finance = financeData;
            break;

          case "petrol":
            // Mocking state petrol prices for demonstration (or could scrape)
            const basePrice = 102.50;
            const variance = state ? (state.length % 5) : 0; // Pseudo-random based on state length
            results.petrol = {
              price: (basePrice + variance).toFixed(2),
              state: state || "National Average"
            };
            break;

          case "cricket":
            // Mocking live cricket match for demonstration
            // In production, fetch from a real cricket API or RSS feed
            const isMatchLive = new Date().getMinutes() % 2 === 0; // Toggle live status every minute for demo
            
            if (isMatchLive) {
              results.cricket = {
                status: "live",
                match: "IND vs AUS, 3rd Test",
                score: "IND 245/4 (62.3 ov)",
                summary: "Kohli 82*, Pant 45* | AUS trail by 150"
              };
            } else {
              results.cricket = {
                status: "upcoming",
                match: "IND vs AUS, 3rd Test"
              };
            }
            break;

          default:
            results[widget] = { error: "Unknown widget" };
        }
      } catch (err: any) {
        console.error(`Error fetching widget ${widget}:`, err.message);
        results[widget] = { error: "Failed to fetch data" };
      }
    });

    await Promise.all(promises);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Live Info Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
