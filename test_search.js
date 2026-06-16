const https = require('https');

function searchLiveVideo(channelName) {
  return new Promise(resolve => {
    const query = encodeURIComponent(channelName + ' live');
    // sp=EgJAAQ%253D%253D filters for LIVE
    https.get(`https://www.youtube.com/results?search_query=${query}&sp=EgJAAQ%253D%253D`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log("CNBC:", await searchLiveVideo("CNBC TV18"));
  console.log("Bloomberg:", await searchLiveVideo("Bloomberg"));
}
run();
