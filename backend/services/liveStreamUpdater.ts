import https from 'https';
import cron from 'node-cron';
import { LiveChannel } from '../models/LiveChannel';

// Hardcoded seed list
const INITIAL_CHANNELS = [
  // Indian News
  { id: "aajtak", name: "Aaj Tak", youtubeHandle: "@aajtak", short: "AT", color: "bg-red-600", category: "Indian" },
  { id: "ndtv", name: "NDTV India", youtubeHandle: "@ndtvindia", short: "ND", color: "bg-blue-600", category: "Indian" },
  { id: "indiatoday", name: "India Today", youtubeHandle: "@indiatoday", short: "IT", color: "bg-red-700", category: "Indian" },
  { id: "zeenews", name: "Zee News", youtubeHandle: "@zeenews", short: "ZN", color: "bg-yellow-600", category: "Indian" },
  { id: "news18", name: "News18 India", youtubeHandle: "@News18India", short: "N18", color: "bg-blue-800", category: "Indian" },
  
  // Global News
  { id: "aljazeera", name: "Al Jazeera", youtubeHandle: "@aljazeeraenglish", short: "AJ", color: "bg-yellow-600", category: "Global" },
  { id: "dwnews", name: "DW News", youtubeHandle: "@dwnews", short: "DW", color: "bg-blue-500", category: "Global" },
  { id: "skynews", name: "Sky News", youtubeHandle: "@SkyNews", short: "SN", color: "bg-blue-700", category: "Global" },
  { id: "bbcnews", name: "BBC News", youtubeHandle: "@BBCNews", short: "BBC", color: "bg-red-800", category: "Global" },
  
  // Business News
  { id: "cnbctv18", name: "CNBC TV18", youtubeHandle: "@CNBCTV18", short: "CN", color: "bg-blue-800", category: "Business" },
  { id: "bloomberg", name: "Bloomberg", youtubeHandle: "@BloombergTelevision", short: "BL", color: "bg-slate-800", category: "Business" }
];

async function fetchLiveVideoId(youtubeHandle: string): Promise<string | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.youtube.com',
      path: `/${youtubeHandle}/live`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const canonicalMatch = data.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)">/);
        if (canonicalMatch && canonicalMatch[1]) {
          resolve(canonicalMatch[1]);
        } else {
          resolve(null);
        }
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
      const videoId = await fetchLiveVideoId(channel.youtubeHandle);
      if (videoId) {
        if (channel.currentVideoId !== videoId) {
          console.log(`[LiveStreamUpdater] ${channel.name}: New video ID found -> ${videoId}`);
        }
        channel.currentVideoId = videoId;
        channel.lastUpdated = new Date();
        await channel.save();
      } else {
        console.log(`[LiveStreamUpdater] ${channel.name}: Could not extract video ID (might be offline)`);
      }
      
      // Delay slightly to prevent rate limiting from YouTube
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('[LiveStreamUpdater] Update cycle complete.');
  } catch (err) {
    console.error('[LiveStreamUpdater] Error updating channels:', err);
  }
}

export function startLiveStreamCron() {
  // Run on startup
  updateLiveChannels();
  
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    updateLiveChannels();
  });
  console.log('[Cron] LiveStreamUpdater scheduled (every 15 mins)');
}
