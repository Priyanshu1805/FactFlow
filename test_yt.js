const https = require('https');
const handles = ['@aajtak', '@ndtvindia', '@indiatoday', '@zeenews', '@News18India', '@aljazeeraenglish', '@dwnews', '@SkyNews', '@BBCNews', '@CNBCTV18', '@BloombergTelevision'];

function checkHandle(handle) {
  return new Promise(resolve => {
    https.get('https://www.youtube.com/' + handle + '/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
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
        let found = null;
        for (const pattern of patterns) {
          const match = data.match(pattern);
          if (match && match[1]) {
            found = match[1];
            break;
          }
        }
        console.log(handle, "=>", found);
        resolve();
      });
    }).on('error', () => { console.log(handle, 'error'); resolve(); });
  })
}

async function run() {
  for (const h of handles) {
    await checkHandle(h);
  }
}
run();
