import https from 'https';
import axios from 'axios';
import cron from 'node-cron';
import { LiveChannel } from '../models/LiveChannel';

// Hardcoded channel configs with their YouTube Channel IDs for the Data API
const INITIAL_CHANNELS = [
  // Indian News
  { id: "aajtak",    name: "Aaj Tak",       youtubeHandle: "@aajtak",             youtubeChannelId: "UCt4t-jeY85JegMlZ-E5UWtA", short: "AT",  color: "bg-red-600",    category: "Indian" },
  { id: "ndtv",      name: "NDTV India",    youtubeHandle: "@ndtvindia",           youtubeChannelId: "UCZFMm1mMw0F81Z37aaEzTUA", short: "ND",  color: "bg-blue-600",   category: "Indian" },
  { id: "indiatoday",name: "India Today",   youtubeHandle: "@indiatoday",          youtubeChannelId: "UCYPvAwZP8pZhSMW8qs7cVCw", short: "IT",  color: "bg-red-700",    category: "Indian" },
  { id: "zeenews",   name: "Zee News",      youtubeHandle: "@zeenews",             youtubeChannelId: "UCJd3ERAkSfpLJMTmKMXXdwQ", short: "ZN",  color: "bg-yellow-600", category: "Indian" },
  { id: "news18",    name: "News18 India",  youtubeHandle: "@News18India",         youtubeChannelId: "UCGnbkEBTVAGlEPcpuMmqSow", short: "N18", color: "bg-blue-800",   category: "Indian" },
  
  // Global News
  { id: "aljazeera", name: "Al Jazeera",    youtubeHandle: "@aljazeeraenglish",    youtubeChannelId: "UCNye-wNBqNL5ZzHSJdse_cw", short: "AJ",  color: "bg-yellow-600", category: "Global" },
  { id: "dwnews",    name: "DW News",       youtubeHandle: "@dwnews",              youtubeChannelId: "UCknLrEdhRCp1aegoMqRaCZg", short: "DW",  color: "bg-blue-500",   category: "Global" },
  { id: "skynews",   name: "Sky News",      youtubeHandle: "@SkyNews",             youtubeChannelId: "UCoMdktPbSTixAyNGwb-UYkQ", short: "SN",  color: "bg-blue-700",   category: "Global" },
  { id: "bbcnews",   name: "BBC News",      youtubeHandle: "@BBCNews",             youtubeChannelId: "UC16niRr50-MSBwiO3YDb3RA", short: "BBC", color: "bg-red-800",    category: "Global" },
  
  // Business News
  { id: "cnbctv18",  name: "CNBC TV18",     youtubeHandle: "@CNBCTV18",            youtubeChannelId: "UCrFiDC7EFQ7VcYGRqMSWQsg", short: "CN",  color: "bg-blue-800",   category: "Business" },
  { id: "bloomberg", name: "Bloomberg",     youtubeHandle: "@BloombergTelevision", youtubeChannelId: "UCIALMKvObZNtJ6AmdCLP7Lg", short: "BL",  color: "bg-slate-800",  category: "Business" }
];

// Method 1: YouTube Data API v3 (most reliable)
async function fetchLiveVideoIdViaAPI(channelId: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !channelId) return null;

  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'id',
        channelId,
        eventType: 'live',
        type: 'video',
        key: apiKey,
        maxResults: 1,
      },
      timeout: 8000,
    });
    const items = res.data?.items || [];
    if (items.length > 0 && items[0].id?.videoId) {
      return items[0].id.videoId;
    }
  } catch (err: any) {
    console.warn(`[LiveStreamUpdater] API fallback for ${channelId}: ${err.message}`);
  }
  return null;
}

// Method 2: Scrape YouTube /live page (fallback)
async function fetchLiveVideoIdViaScrape(youtubeHandle: string): Promise<string | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.youtube.com',
      path: `/${youtubeHandle}/live`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Try multiple patterns YouTube uses
        const patterns = [
          /"videoId":"([a-zA-Z0-9_-]{11})"/,
          /watch\?v=([a-zA-Z0-9_-]{11})/,
          /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)">/,
        ];
        for (const pattern of patterns) {
          const match = data.match(pattern);
          if (match && match[1]) {
            resolve(match[1]);
            return;
          }
        }
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

export async function updateLiveChannels() {
  console.log('[LiveStreamUpdater] Starting live stream update cycle...');
  try {
    let channels = await LiveChannel.find();

    // Seed database if empty
    if (channels.length === 0) {
      console.log('[LiveStreamUpdater] Seeding initial channel database...');
      await LiveChannel.insertMany(INITIAL_CHANNELS);
      channels = await LiveChannel.find();
    }

    for (const channel of channels) {
      // Find channel config to get the youtubeChannelId for API method
      const config = INITIAL_CHANNELS.find(c => c.id === channel.id);

      // Try API first, then scrape as fallback
      let videoId = config?.youtubeChannelId
        ? await fetchLiveVideoIdViaAPI(config.youtubeChannelId)
        : null;

      if (!videoId) {
        console.log(`[LiveStreamUpdater] ${channel.name}: API returned no result, trying scrape...`);
        videoId = await fetchLiveVideoIdViaScrape(channel.youtubeHandle);
      }

      if (videoId) {
        if (channel.currentVideoId !== videoId) {
          console.log(`[LiveStreamUpdater] ✅ ${channel.name}: Video ID updated -> ${videoId}`);
        }
        channel.currentVideoId = videoId;
        channel.lastUpdated = new Date();
        await channel.save();
      } else {
        console.log(`[LiveStreamUpdater] ⚠️ ${channel.name}: No live stream found (might be offline)`);
      }

      // Delay slightly to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    console.log('[LiveStreamUpdater] ✅ Update cycle complete.');
  } catch (err) {
    console.error('[LiveStreamUpdater] Error updating channels:', err);
  }
}

export function startLiveStreamCron() {
  // Run on startup
  updateLiveChannels();

  // Run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    updateLiveChannels();
  });
  console.log('[Cron] LiveStreamUpdater scheduled (every 10 mins)');
}
