import https from 'https';
import cron from 'node-cron';
import { LiveChannel } from '../models/LiveChannel';

const INITIAL_CHANNELS = [
  { id: "aajtak",     name: "Aaj Tak",      youtubeHandle: "@aajtak",             short: "AT",  color: "bg-red-600",    category: "Indian" },
  { id: "ndtv",       name: "NDTV India",   youtubeHandle: "@ndtvindia",           short: "ND",  color: "bg-blue-600",   category: "Indian" },
  { id: "indiatoday", name: "India Today",  youtubeHandle: "@indiatoday",          short: "IT",  color: "bg-red-700",    category: "Indian" },
  { id: "zeenews",    name: "Zee News",     youtubeHandle: "@zeenews",             short: "ZN",  color: "bg-yellow-600", category: "Indian" },
  { id: "news18",     name: "News18 India", youtubeHandle: "@News18India",         short: "N18", color: "bg-blue-800",   category: "Indian" },
  { id: "aljazeera",  name: "Al Jazeera",   youtubeHandle: "@aljazeeraenglish",    short: "AJ",  color: "bg-yellow-600", category: "Global" },
  { id: "dwnews",     name: "DW News",      youtubeHandle: "@dwnews",              short: "DW",  color: "bg-blue-500",   category: "Global" },
  { id: "skynews",    name: "Sky News",     youtubeHandle: "@SkyNews",             short: "SN",  color: "bg-blue-700",   category: "Global" },
  { id: "bbcnews",    name: "BBC News",     youtubeHandle: "@BBCNews",             short: "BBC", color: "bg-red-800",    category: "Global" },
  { id: "cnbctv18",   name: "CNBC TV18",   youtubeHandle: "@CNBCTV18",            short: "CN",  color: "bg-blue-800",   category: "Business" },
  { id: "bloomberg",  name: "Bloomberg",    youtubeHandle: "@BloombergTelevision", short: "BL",  color: "bg-slate-800",  category: "Business" },
];

// Scrape YouTube /live page to extract live video ID
async function fetchLiveVideoId(youtubeHandle: string): Promise<string | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.youtube.com',
      path: `/${youtubeHandle}/live`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
      }
    };

    const req = https.get(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        resolve(null);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const patterns = [
          /"videoId":"([a-zA-Z0-9_-]{11})"/,
          /\"current_video_id\":\"([a-zA-Z0-9_-]{11})\"/,
          /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/,
          /watch\?v=([a-zA-Z0-9_-]{11})&amp;/,
          /"url":"\/watch\?v=([a-zA-Z0-9_-]{11})"/,
        ];
        for (const pattern of patterns) {
          const match = data.match(pattern);
          if (match?.[1]) {
            resolve(match[1]);
            return;
          }
        }
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(12000, () => { req.destroy(); resolve(null); });
  });
}

export async function updateLiveChannels() {
  console.log('[LiveStreamUpdater] Starting live stream update cycle...');
  try {
    let channels = await LiveChannel.find();

    if (channels.length === 0) {
      console.log('[LiveStreamUpdater] Seeding initial channels...');
      await LiveChannel.insertMany(INITIAL_CHANNELS);
      channels = await LiveChannel.find();
    }

    for (const channel of channels) {
      const videoId = await fetchLiveVideoId(channel.youtubeHandle);
      if (videoId) {
        channel.currentVideoId = videoId;
        channel.lastUpdated = new Date();
        await channel.save();
        console.log(`[LiveStreamUpdater] ✅ ${channel.name}: ${videoId}`);
      } else {
        console.log(`[LiveStreamUpdater] ⚠️ ${channel.name}: offline or no live stream`);
      }
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    console.log('[LiveStreamUpdater] ✅ Update cycle complete.');
  } catch (err) {
    console.error('[LiveStreamUpdater] Error:', err);
  }
}

export function startLiveStreamCron() {
  updateLiveChannels();
  cron.schedule('*/10 * * * *', () => updateLiveChannels());
  console.log('[Cron] LiveStreamUpdater scheduled (every 10 mins)');
}
