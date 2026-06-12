"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterFetcher = masterFetcher;
const axios_1 = __importDefault(require("axios"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const cheerio = __importStar(require("cheerio"));
const rssParser = new rss_parser_1.default({
    timeout: 15000,
    customFields: {
        item: [["media:content", "mediaContent"], ["enclosure", "enclosure"]],
    },
});
// ─────────────────────────────────────────────
// ALL NEWS SOURCES — 150+ feeds across 7 categories
// Politics alone has 100+ dedicated sources
// Cycle: Every 15 minutes via newsCycleManager
// ─────────────────────────────────────────────
const SOURCES = {
    rss: [
        // ══════════════════════════════════════════
        // 🗞️ NEWSPAPER (General News)
        // ══════════════════════════════════════════
        { url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", category: "Newspaper", source: "Times of India" },
        { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "Newspaper", source: "The Hindu" },
        { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Newspaper", source: "BBC World" },
        { url: "https://feeds.reuters.com/reuters/topNews", category: "Newspaper", source: "Reuters" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "Newspaper", source: "NYT World" },
        { url: "https://www.ndtv.com/rss/top-stories", category: "Newspaper", source: "NDTV" },
        { url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", category: "Newspaper", source: "Hindustan Times" },
        { url: "https://www.thehindu.com/feeder/default.rss", category: "Newspaper", source: "The Hindu Top" },
        { url: "https://www.deccanherald.com/rss/national.rss", category: "Newspaper", source: "Deccan Herald" },
        { url: "https://feeds.feedburner.com/NDTV-LatestNews", category: "Newspaper", source: "NDTV Latest" },
        // ══════════════════════════════════════════
        // 🏛️ POLITICS — 100+ SOURCES
        // India National Politics
        // ══════════════════════════════════════════
        // Major Indian News - Politics Sections
        { url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", category: "Politics", source: "TOI Politics" },
        { url: "https://economictimes.indiatimes.com/politics-and-nation/rssfeeds/1368349775.cms", category: "Politics", source: "Economic Times Politics" },
        { url: "https://www.ndtv.com/rss/india", category: "Politics", source: "NDTV India" },
        { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "Politics", source: "The Hindu National" },
        { url: "https://www.thehindu.com/news/national/kerala/feeder/default.rss", category: "Politics", source: "The Hindu Kerala" },
        { url: "https://www.thehindu.com/news/national/other-states/feeder/default.rss", category: "Politics", source: "The Hindu States" },
        { url: "https://www.hindustantimes.com/feeds/rss/politics/rssfeed.xml", category: "Politics", source: "HT Politics" },
        { url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", category: "Politics", source: "HT India" },
        { url: "https://www.indiatoday.in/rss/1206550", category: "Politics", source: "India Today" },
        { url: "https://www.indiatoday.in/rss/1206614", category: "Politics", source: "India Today Politics" },
        // NDTV - Multiple Feeds
        { url: "https://www.ndtv.com/rss/politics", category: "Politics", source: "NDTV Politics" },
        { url: "https://feeds.feedburner.com/ndtv/politics", category: "Politics", source: "NDTV Politics Feed" },
        // Indian Express Politics
        { url: "https://indianexpress.com/section/political-pulse/feed/", category: "Politics", source: "Indian Express Political Pulse" },
        { url: "https://indianexpress.com/section/politics/feed/", category: "Politics", source: "Indian Express Politics" },
        { url: "https://indianexpress.com/section/india/feed/", category: "Politics", source: "Indian Express India" },
        // LiveMint Politics
        { url: "https://www.livemint.com/rss/politics", category: "Politics", source: "LiveMint Politics" },
        { url: "https://feeds.livemint.com/politics", category: "Politics", source: "Mint Politics" },
        // Business Standard
        { url: "https://www.business-standard.com/rss/politics-1021.rss", category: "Politics", source: "Business Standard Politics" },
        { url: "https://www.business-standard.com/rss/current-affairs-1119.rss", category: "Politics", source: "BS Current Affairs" },
        // Outlook India
        { url: "https://www.outlookindia.com/rss/national/", category: "Politics", source: "Outlook India National" },
        { url: "https://www.outlookindia.com/rss/politics/", category: "Politics", source: "Outlook Politics" },
        // The Wire
        { url: "https://thewire.in/politics/feed", category: "Politics", source: "The Wire Politics" },
        { url: "https://thewire.in/government/feed", category: "Politics", source: "The Wire Government" },
        // Scroll.in
        { url: "https://scroll.in/feed", category: "Politics", source: "Scroll.in" },
        { url: "https://scroll.in/article/feed", category: "Politics", source: "Scroll Articles" },
        // The Print
        { url: "https://theprint.in/politics/feed/", category: "Politics", source: "The Print Politics" },
        { url: "https://theprint.in/india/feed/", category: "Politics", source: "The Print India" },
        { url: "https://theprint.in/governance/feed/", category: "Politics", source: "The Print Governance" },
        // Quint
        { url: "https://www.thequint.com/rss/politics.xml", category: "Politics", source: "The Quint Politics" },
        { url: "https://www.thequint.com/rss/india.xml", category: "Politics", source: "The Quint India" },
        // NewsLaundry
        { url: "https://www.newslaundry.com/rss", category: "Politics", source: "NewsLaundry" },
        // Deccan Herald
        { url: "https://www.deccanherald.com/rss/politics.rss", category: "Politics", source: "Deccan Herald Politics" },
        { url: "https://www.deccanherald.com/rss/national.rss", category: "Politics", source: "Deccan Herald National" },
        // Firstpost
        { url: "https://www.firstpost.com/rss/india.xml", category: "Politics", source: "Firstpost India" },
        { url: "https://www.firstpost.com/rss/politics.xml", category: "Politics", source: "Firstpost Politics" },
        // DNA India
        { url: "https://www.dnaindia.com/feeds/politics.xml", category: "Politics", source: "DNA India Politics" },
        { url: "https://www.dnaindia.com/feeds/india.xml", category: "Politics", source: "DNA India News" },
        // Zee News
        { url: "https://zeenews.india.com/rss/india-national-news.xml", category: "Politics", source: "Zee News India" },
        { url: "https://zeenews.india.com/rss/election-news.xml", category: "Politics", source: "Zee News Elections" },
        // NewsX / Republic etc
        { url: "https://www.news18.com/rss/politics.xml", category: "Politics", source: "News18 Politics" },
        { url: "https://www.news18.com/rss/india.xml", category: "Politics", source: "News18 India" },
        // Indian News Agencies
        { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", category: "Politics", source: "PIB India" },
        { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=8", category: "Politics", source: "PIB Parliament" },
        // State Politics Feeds
        { url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss", category: "Politics", source: "TN Politics" },
        { url: "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss", category: "Politics", source: "AP Politics" },
        { url: "https://www.thehindu.com/news/national/karnataka/feeder/default.rss", category: "Politics", source: "Karnataka Politics" },
        { url: "https://www.hindustantimes.com/feeds/rss/delhi-news/rssfeed.xml", category: "Politics", source: "Delhi Politics" },
        // Parliament / Parliament Watch
        { url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", category: "Politics", source: "TOI Parliament" },
        { url: "https://economictimes.indiatimes.com/rssfeeds/13357270.cms", category: "Politics", source: "ET Parliament" },
        // Elections
        { url: "https://www.ndtv.com/rss/elections", category: "Politics", source: "NDTV Elections" },
        // International Politics
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", category: "Politics", source: "NYT Politics" },
        { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", category: "Politics", source: "BBC UK Politics" },
        { url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", category: "Politics", source: "BBC US Politics" },
        { url: "https://rss.politico.com/politics-news.xml", category: "Politics", source: "Politico" },
        { url: "https://www.politico.com/rss/politicopicks.xml", category: "Politics", source: "Politico Picks" },
        { url: "https://thehill.com/rss/syndicator/19109", category: "Politics", source: "The Hill Politics" },
        { url: "https://thehill.com/feed/", category: "Politics", source: "The Hill" },
        { url: "https://www.theguardian.com/politics/rss", category: "Politics", source: "Guardian Politics" },
        { url: "https://www.theguardian.com/world/rss", category: "Politics", source: "Guardian World" },
        { url: "https://feeds.washingtonpost.com/rss/politics", category: "Politics", source: "Washington Post Politics" },
        { url: "https://feeds.washingtonpost.com/rss/world", category: "Politics", source: "Washington Post World" },
        { url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", category: "Politics", source: "BBC Africa" },
        { url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml", category: "Politics", source: "BBC Asia" },
        { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml", category: "Politics", source: "BBC Europe" },
        { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", category: "Politics", source: "BBC Middle East" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", category: "Politics", source: "NYT Middle East" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml", category: "Politics", source: "NYT Asia" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml", category: "Politics", source: "NYT Europe" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Africa.xml", category: "Politics", source: "NYT Africa" },
        { url: "https://feeds.reuters.com/reuters/worldNews", category: "Politics", source: "Reuters World" },
        { url: "https://feeds.reuters.com/Reuters/PoliticsNews", category: "Politics", source: "Reuters Politics" },
        { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Politics", source: "Al Jazeera" },
        { url: "https://www.aljazeera.com/xml/rss/politics.xml", category: "Politics", source: "Al Jazeera Politics" },
        { url: "https://foreignpolicy.com/feed/", category: "Politics", source: "Foreign Policy" },
        { url: "https://www.foreignaffairs.com/rss.xml", category: "Politics", source: "Foreign Affairs" },
        { url: "https://www.brookings.edu/feed/", category: "Politics", source: "Brookings" },
        { url: "https://www.vox.com/rss/world-politics/index.xml", category: "Politics", source: "Vox World Politics" },
        { url: "https://www.vox.com/rss/policy-and-politics/index.xml", category: "Politics", source: "Vox Policy" },
        { url: "https://www.economist.com/politics/rss.xml", category: "Politics", source: "The Economist Politics" },
        { url: "https://www.ft.com/world?format=rss", category: "Politics", source: "Financial Times World" },
        { url: "https://www.dw.com/rss/rdf/en-all-20100305.xml", category: "Politics", source: "Deutsche Welle" },
        { url: "https://www.dw.com/rss/rdf/en-pol-20100305.xml", category: "Politics", source: "DW Politics" },
        { url: "https://en.rfi.fr/rss/en/Politics.xml", category: "Politics", source: "Radio France International" },
        { url: "https://www.scmp.com/rss/91/feed", category: "Politics", source: "SCMP Asia" },
        { url: "https://www.dawn.com/feeds/home", category: "Politics", source: "Dawn Pakistan" },
        { url: "https://tribune.com.pk/feed", category: "Politics", source: "Express Tribune" },
        { url: "https://timesofindia.indiatimes.com/rssfeeds/7098551.cms", category: "Politics", source: "TOI World Affairs" },
        // ══════════════════════════════════════════
        // ⚽ SPORTS
        // ══════════════════════════════════════════
        { url: "https://www.espn.com/espn/rss/news", category: "Sports", source: "ESPN" },
        { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports", source: "BBC Sports" },
        { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", category: "Sports", source: "TOI Sports" },
        { url: "https://www.cricbuzz.com/rss/cricket-news", category: "Sports", source: "Cricbuzz" },
        { url: "https://www.goal.com/feeds/en/news", category: "Sports", source: "Goal.com" },
        { url: "https://www.skysports.com/rss/12040", category: "Sports", source: "Sky Sports" },
        { url: "https://www.thehindu.com/sport/feeder/default.rss", category: "Sports", source: "The Hindu Sports" },
        // ══════════════════════════════════════════
        // 💻 TECH
        // ══════════════════════════════════════════
        { url: "https://techcrunch.com/feed/", category: "Tech", source: "TechCrunch" },
        { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "Tech", source: "BBC Tech" },
        { url: "https://www.wired.com/feed/rss", category: "Tech", source: "Wired" },
        { url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech", source: "Ars Technica" },
        { url: "https://www.theverge.com/rss/index.xml", category: "Tech", source: "The Verge" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", category: "Tech", source: "NYT Tech" },
        { url: "https://feeds.feedburner.com/venturebeat/SZYF", category: "Tech", source: "VentureBeat" },
        { url: "https://www.zdnet.com/news/rss.xml", category: "Tech", source: "ZDNet" },
        { url: "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms", category: "Tech", source: "ET Tech" },
        { url: "https://www.gadgets360.com/rss/reviews-feeds", category: "Tech", source: "Gadgets360" },
        { url: "https://www.engadget.com/rss.xml", category: "Tech", source: "Engadget" },
        { url: "https://gizmodo.com/feed/rss", category: "Tech", source: "Gizmodo" },
        // ══════════════════════════════════════════
        // 💄 LIFESTYLE
        // ══════════════════════════════════════════
        { url: "https://www.vogue.in/feed/rss", category: "Lifestyle", source: "Vogue India" },
        { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", category: "Lifestyle", source: "BBC Entertainment" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml", category: "Lifestyle", source: "NYT Style" },
        { url: "https://timesofindia.indiatimes.com/rssfeeds/2886704.cms", category: "Lifestyle", source: "TOI Life" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Travel.xml", category: "Lifestyle", source: "NYT Travel" },
        { url: "https://www.bollywoodhungama.com/rss/bollywood-news/", category: "Lifestyle", source: "Bollywood Hungama" },
        { url: "https://www.filmfare.com/rss/news.xml", category: "Lifestyle", source: "Filmfare" },
        { url: "https://www.pinkvilla.com/rss.xml", category: "Lifestyle", source: "PinkVilla" },
        { url: "https://www.healthline.com/rss/health-news", category: "Lifestyle", source: "Healthline" },
        // ══════════════════════════════════════════
        // 🔥 TRENDING — 100+ SOURCES
        // ══════════════════════════════════════════
        { url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN", category: "Trending", source: "Google Trends India" },
        { url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US", category: "Trending", source: "Google Trends US" },
        { url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB", category: "Trending", source: "Google Trends UK" },
        { url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=AU", category: "Trending", source: "Google Trends Australia" },
        { url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=CA", category: "Trending", source: "Google Trends Canada" },
        { url: "https://timesofindia.indiatimes.com/rssfeedmostread.cms", category: "Trending", source: "TOI Most Read" },
        { url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", category: "Trending", source: "TOI Top" },
        { url: "https://www.indiatoday.in/rss/1206550", category: "Trending", source: "India Today Trending" },
        { url: "https://www.hindustantimes.com/feeds/rss/trending/rssfeed.xml", category: "Trending", source: "HT Trending" },
        { url: "https://feeds.bbci.co.uk/news/rss.xml", category: "Trending", source: "BBC Top News" },
        { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Trending", source: "BBC World Top" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", category: "Trending", source: "NYT Homepage" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/MostViewed.xml", category: "Trending", source: "NYT Most Viewed" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/MostShared.xml", category: "Trending", source: "NYT Most Shared" },
        { url: "https://www.buzzfeed.com/index.xml", category: "Trending", source: "BuzzFeed Top" },
        { url: "https://www.buzzfeed.com/trending.xml", category: "Trending", source: "BuzzFeed Trending" },
        { url: "https://www.reddit.com/r/popular/top/.rss?t=day", category: "Trending", source: "Reddit Popular" },
        { url: "https://www.reddit.com/r/all/top/.rss?t=day", category: "Trending", source: "Reddit All" },
        { url: "https://www.reddit.com/r/news/top/.rss?t=day", category: "Trending", source: "Reddit News" },
        { url: "https://www.huffpost.com/section/front-page/feed", category: "Trending", source: "HuffPost" },
        { url: "https://nypost.com/trending/feed/", category: "Trending", source: "NY Post Trending" },
        { url: "https://www.wsj.com/xml/rss/3_7085.xml", category: "Trending", source: "WSJ Top Stories" },
        { url: "https://www.npr.org/rss/rss.php?id=1001", category: "Trending", source: "NPR Top Stories" },
        { url: "https://abcnews.go.com/abcnews/topstories", category: "Trending", source: "ABC News Top" },
        { url: "https://www.cbsnews.com/latest/rss/main", category: "Trending", source: "CBS News Top" },
        { url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", category: "Trending", source: "WSJ World" },
        { url: "https://www.independent.co.uk/news/world/rss", category: "Trending", source: "The Independent Top" },
        { url: "https://www.telegraph.co.uk/news/rss.xml", category: "Trending", source: "The Telegraph" },
        { url: "https://news.yahoo.com/rss/most-viewed", category: "Trending", source: "Yahoo Most Viewed" },
        { url: "https://news.yahoo.com/rss/trending", category: "Trending", source: "Yahoo Trending" },
        { url: "https://www.thesun.co.uk/news/feed/", category: "Trending", source: "The Sun Top" },
        { url: "https://www.mirror.co.uk/news/rss.xml", category: "Trending", source: "Daily Mirror" },
        { url: "https://www.dailymail.co.uk/articles.rss", category: "Trending", source: "Daily Mail" },
        { url: "https://feeds.foxnews.com/foxnews/latest", category: "Trending", source: "Fox News Latest" },
        { url: "https://feeds.foxnews.com/foxnews/most-popular", category: "Trending", source: "Fox News Popular" },
        { url: "https://www.latimes.com/world-nation/rss2.0.xml", category: "Trending", source: "LA Times World" },
        { url: "https://www.latimes.com/local/rss2.0.xml", category: "Trending", source: "LA Times Local" },
        { url: "https://www.chicagotribune.com/arcio/rss/category/news/?query=display_date:[now-2d+TO+now]&sort=display_date:desc", category: "Trending", source: "Chicago Tribune" },
        { url: "https://www.bostonglobe.com/rss/news", category: "Trending", source: "Boston Globe" },
        { url: "https://www.thestar.com/search/?f=rss&t=article&c=news&l=50&s=start_time&sd=desc", category: "Trending", source: "Toronto Star" },
        { url: "https://www.cbc.ca/cmlink/rss-topstories", category: "Trending", source: "CBC Top Stories" },
        { url: "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/news/", category: "Trending", source: "Globe and Mail" },
        { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Trending", source: "Al Jazeera Top" },
        { url: "https://www.scmp.com/rss/91/feed", category: "Trending", source: "SCMP Top" },
        { url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", category: "Trending", source: "TOI News" },
        { url: "https://www.ndtv.com/rss/top-stories", category: "Trending", source: "NDTV Top Stories" },
        { url: "https://www.indiatvnews.com/rssnews/topstory.xml", category: "Trending", source: "India TV" },
        { url: "https://zeenews.india.com/rss/india-national-news.xml", category: "Trending", source: "Zee News Top" },
        { url: "https://www.news18.com/rss/india.xml", category: "Trending", source: "News18 Top" },
        { url: "https://thewire.in/rss", category: "Trending", source: "The Wire Top" },
        { url: "https://scroll.in/feed", category: "Trending", source: "Scroll.in Top" },
        { url: "https://www.firstpost.com/rss/india.xml", category: "Trending", source: "Firstpost Top" },
        { url: "https://indianexpress.com/section/india/feed/", category: "Trending", source: "Indian Express Top" },
        { url: "https://indianexpress.com/section/trending/feed/", category: "Trending", source: "Indian Express Trending" },
        { url: "https://www.deccanherald.com/rss/national.rss", category: "Trending", source: "Deccan Herald Top" },
        { url: "https://www.tribuneindia.com/rss/feed.aspx?cat_id=27", category: "Trending", source: "The Tribune Top" },
        { url: "https://www.asianage.com/rss_feed", category: "Trending", source: "Asian Age" },
        { url: "https://www.telegraphindia.com/rss", category: "Trending", source: "Telegraph India" },
        { url: "https://www.thehindubusinessline.com/news/national/feeder/default.rss", category: "Trending", source: "Business Line" },
        { url: "https://www.livemint.com/rss/news", category: "Trending", source: "LiveMint News" },
        { url: "https://www.business-standard.com/rss/home_page_top_stories.rss", category: "Trending", source: "Business Standard Top" },
        { url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms", category: "Trending", source: "Economic Times Top" },
        { url: "https://www.financialexpress.com/feed/", category: "Trending", source: "Financial Express" },
        { url: "https://www.moneycontrol.com/rss/MCtopnews.xml", category: "Trending", source: "MoneyControl" },
        { url: "https://www.cnbctv18.com/commonfeeds/v1/cne/rss/india.xml", category: "Trending", source: "CNBC TV18" },
        { url: "https://www.bqprime.com/feed", category: "Trending", source: "BQ Prime" },
        { url: "https://www.republicworld.com/rss/india-news.xml", category: "Trending", source: "Republic Top" },
        { url: "https://www.wionews.com/rss/india-news.xml", category: "Trending", source: "WION India" },
        { url: "https://www.wionews.com/rss/world-news.xml", category: "Trending", source: "WION World" },
        { url: "https://www.wionews.com/rss/trending-news.xml", category: "Trending", source: "WION Trending" },
        { url: "https://www.newsminute.com/feed", category: "Trending", source: "News Minute" },
        { url: "https://theprint.in/feed/", category: "Trending", source: "The Print Top" },
        { url: "https://www.thequint.com/rss/news.xml", category: "Trending", source: "The Quint Top" },
        { url: "https://www.outlookindia.com/rss/national/", category: "Trending", source: "Outlook Top" },
        { url: "https://www.freepressjournal.in/rss/india", category: "Trending", source: "Free Press Journal" },
        { url: "https://www.mid-day.com/Resources/midday/rss/india-news.xml", category: "Trending", source: "Mid-Day" },
        { url: "https://www.deccanchronicle.com/rss_feed/", category: "Trending", source: "Deccan Chronicle" },
        { url: "https://www.mathrubhumi.com/rss/national.xml", category: "Trending", source: "Mathrubhumi" },
        { url: "https://www.manoramaonline.com/news/india.rss", category: "Trending", source: "Manorama" },
        { url: "https://english.mathrubhumi.com/rss/news/india.xml", category: "Trending", source: "Mathrubhumi English" },
        { url: "https://www.newindianexpress.com/Nation/rssfeed/?id=170&getXmlFeed=true", category: "Trending", source: "New Indian Express" },
        { url: "https://www.thehansindia.com/rss/news/national", category: "Trending", source: "Hans India" },
        { url: "https://www.telanganatoday.com/feed", category: "Trending", source: "Telangana Today" },
        { url: "https://www.ptinews.com/rss/national.xml", category: "Trending", source: "PTI" },
        { url: "https://www.aninews.in/rss/feed/category/national/", category: "Trending", source: "ANI National" },
        { url: "https://www.dailypioneer.com/rss/india.xml", category: "Trending", source: "Daily Pioneer" },
        { url: "https://thestateman.com/feed/", category: "Trending", source: "The Statesman" },
        { url: "https://mumbaimirror.indiatimes.com/rssfeeds/4718605.cms", category: "Trending", source: "Mumbai Mirror" },
        { url: "https://bangaloremirror.indiatimes.com/rssfeeds/21307616.cms", category: "Trending", source: "Bangalore Mirror" },
        { url: "https://ahmedabadmirror.indiatimes.com/rssfeeds/4718420.cms", category: "Trending", source: "Ahmedabad Mirror" },
        { url: "https://punemirror.indiatimes.com/rssfeeds/4724220.cms", category: "Trending", source: "Pune Mirror" },
        { url: "https://www.lokmat.com/rss/national.xml", category: "Trending", source: "Lokmat" },
        { url: "https://www.abplive.com/news/india/feed", category: "Trending", source: "ABP Live" },
        { url: "https://www.aajtak.in/rssfeeds/?id=home", category: "Trending", source: "Aaj Tak" },
        { url: "https://www.tv9hindi.com/national/feed", category: "Trending", source: "TV9 Bharatvarsh" },
        { url: "https://www.news24online.com/national/feed", category: "Trending", source: "News24" },
        { url: "https://www.amarujala.com/rss/india-news.xml", category: "Trending", source: "Amar Ujala" },
        { url: "https://www.jagran.com/rss/news-national.xml", category: "Trending", source: "Dainik Jagran" },
        { url: "https://www.bhaskar.com/rss-feed/1061/", category: "Trending", source: "Dainik Bhaskar" },
        { url: "https://www.patrika.com/rss/india-news.xml", category: "Trending", source: "Patrika" },
        { url: "https://www.prabhatkhabar.com/rss/national", category: "Trending", source: "Prabhat Khabar" },
        { url: "https://www.punjabkesari.in/rss/national.xml", category: "Trending", source: "Punjab Kesari" },
        { url: "https://www.navjivanindia.com/rss/india", category: "Trending", source: "Navjivan" },
        { url: "https://www.jansatta.com/national/feed/", category: "Trending", source: "Jansatta" },
        { url: "https://navbharattimes.indiatimes.com/rssfeeds/4695026.cms", category: "Trending", source: "NBT" },
        { url: "https://zeenews.india.com/hindi/india/rss", category: "Trending", source: "Zee News Hindi" },
        { url: "https://www.ndtvindia.in/rss/top-stories", category: "Trending", source: "NDTV India Hindi" },
        // ══════════════════════════════════════════
        // 😂 MEMES
        // ══════════════════════════════════════════
        { url: "https://www.reddit.com/r/memes/top/.rss?t=day", category: "Memes", source: "r/memes" },
        { url: "https://www.reddit.com/r/dankmemes/top/.rss?t=day", category: "Memes", source: "r/dankmemes" },
        { url: "https://knowyourmeme.com/news/feed", category: "Memes", source: "KnowYourMeme" },
        { url: "https://www.reddit.com/r/ProgrammerHumor/top/.rss?t=day", category: "Memes", source: "r/ProgrammerHumor" },
    ],
    reddit: [
        // Politics — many subreddits
        { subreddit: "politics", category: "Politics" },
        { subreddit: "IndianPolitics", category: "Politics" },
        { subreddit: "india", category: "Politics" },
        { subreddit: "worldpolitics", category: "Politics" },
        { subreddit: "geopolitics", category: "Politics" },
        { subreddit: "worldnews", category: "Politics" },
        { subreddit: "PoliticalHumor", category: "Politics" },
        { subreddit: "uspolitics", category: "Politics" },
        { subreddit: "UKpolitics", category: "Politics" },
        // General
        { subreddit: "worldnews", category: "Newspaper" },
        // Sports
        { subreddit: "sports", category: "Sports" },
        { subreddit: "cricket", category: "Sports" },
        { subreddit: "soccer", category: "Sports" },
        { subreddit: "nba", category: "Sports" },
        // Tech
        { subreddit: "technology", category: "Tech" },
        { subreddit: "tech", category: "Tech" },
        { subreddit: "artificial", category: "Tech" },
        { subreddit: "gadgets", category: "Tech" },
        { subreddit: "science", category: "Tech" },
        // Lifestyle
        { subreddit: "travel", category: "Lifestyle" },
        { subreddit: "fashion", category: "Lifestyle" },
        { subreddit: "bollywood", category: "Lifestyle" },
        // Trending
        { subreddit: "popular", category: "Trending" },
        // Memes
        { subreddit: "memes", category: "Memes" },
        { subreddit: "dankmemes", category: "Memes" },
    ],
    nitter: [
        { account: "BBCBreaking", category: "Trending" },
        { account: "Reuters", category: "Newspaper" },
        { account: "ndtv", category: "Politics" },
        { account: "ANI", category: "Politics" },
        { account: "MEAIndia", category: "Politics" },
        { account: "PMOIndia", category: "Politics" },
        { account: "AmitShah", category: "Politics" },
        { account: "RahulGandhi", category: "Politics" },
        { account: "TechCrunch", category: "Tech" },
        { account: "verge", category: "Tech" },
    ],
};
// ─────────────────────────────────────────────
// SCRAPE FULL CONTENT FALLBACK
// ─────────────────────────────────────────────
async function scrapeArticleFromUrl(url) {
    if (!url || !url.startsWith("http"))
        return { text: null, image: null };
    try {
        const res = await axios_1.default.get(url, {
            headers: { "User-Agent": "FactFlow/2.0 NewsAggregator" },
            timeout: 8000,
        });
        const $ = cheerio.load(res.data);
        let text = "";
        $("article p, .article-body p, .story-body p, main p").each((_, el) => {
            const t = $(el).text().trim();
            if (t.length > 60)
                text += t + "\n\n";
        });
        const ogImage = $('meta[property="og:image"]').attr("content") || null;
        return { text: text.length > 300 ? text.trim() : null, image: ogImage };
    }
    catch {
        return { text: null, image: null };
    }
}
// ─────────────────────────────────────────────
// FETCHERS
// ─────────────────────────────────────────────
async function fetchRss() {
    const results = [];
    // Run all RSS feeds in parallel batches of 20 for speed
    const batchSize = 20;
    for (let i = 0; i < SOURCES.rss.length; i += batchSize) {
        const batch = SOURCES.rss.slice(i, i + batchSize);
        const settled = await Promise.allSettled(batch.map(async (feed) => {
            const parsed = await rssParser.parseURL(feed.url);
            return parsed.items.slice(0, 8).map((item) => {
                let image = "";
                if (item.enclosure?.url)
                    image = item.enclosure.url;
                else if (item.mediaContent?.$?.url)
                    image = item.mediaContent.$.url;
                else {
                    const match = item.content?.match(/<img[^>]+src="([^">]+)"/);
                    if (match)
                        image = match[1];
                }
                return {
                    title: item.title,
                    url: item.link,
                    description: item.contentSnippet || item.title,
                    imageUrl: image,
                    source: feed.source,
                    category: feed.category,
                    publishedAt: item.isoDate || new Date().toISOString(),
                    type: "rss"
                };
            });
        }));
        settled.forEach((result, idx) => {
            if (result.status === "fulfilled") {
                results.push(...result.value);
            }
            else {
                console.warn(`[MasterFetcher] RSS failed: ${batch[idx].url}`);
            }
        });
    }
    return results;
}
async function fetchReddit() {
    const results = [];
    for (const feed of SOURCES.reddit) {
        try {
            const res = await axios_1.default.get(`https://www.reddit.com/r/${feed.subreddit}/hot.json?limit=10`, {
                headers: { "User-Agent": "FactFlow/2.0 NewsAggregator" },
                timeout: 10000,
            });
            const posts = res.data.data.children.map((child) => {
                const data = child.data;
                return {
                    title: data.title,
                    url: `https://reddit.com${data.permalink}`,
                    description: data.selftext?.slice(0, 300) || data.title,
                    imageUrl: data.url?.match(/\.(jpeg|jpg|gif|png)$/) ? data.url : "",
                    source: `r/${feed.subreddit}`,
                    category: feed.category,
                    publishedAt: new Date(data.created_utc * 1000).toISOString(),
                    score: data.ups,
                    type: "reddit"
                };
            });
            results.push(...posts);
        }
        catch (e) {
            console.warn(`[MasterFetcher] Reddit failed: ${feed.subreddit}`);
        }
    }
    return results;
}
async function fetchNitter() {
    const results = [];
    const instances = ["https://nitter.net", "https://nitter.cz", "https://nitter.nl"];
    for (const feed of SOURCES.nitter) {
        for (const instance of instances) {
            try {
                const url = `${instance}/${feed.account}/rss`;
                const parsed = await rssParser.parseURL(url);
                const items = parsed.items.slice(0, 5).map((item) => ({
                    title: item.title?.slice(0, 200),
                    url: item.link,
                    description: item.contentSnippet || item.title,
                    imageUrl: "",
                    source: `@${feed.account}`,
                    category: feed.category,
                    publishedAt: item.isoDate || new Date().toISOString(),
                    type: "nitter"
                }));
                results.push(...items);
                break;
            }
            catch (e) { }
        }
    }
    return results;
}
async function fetchFreeApis() {
    const results = [];
    // 1. NewsAPI — if key available, fetch politics specifically too
    if (process.env.NEWS_API_KEY) {
        try {
            const [general, politics] = await Promise.allSettled([
                axios_1.default.get(`https://newsapi.org/v2/top-headlines?country=in&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`),
                axios_1.default.get(`https://newsapi.org/v2/everything?q=india+politics+parliament&language=en&pageSize=20&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`)
            ]);
            if (general.status === "fulfilled") {
                results.push(...general.value.data.articles.map((a) => ({
                    title: a.title, url: a.url, description: a.description,
                    imageUrl: a.urlToImage, source: a.source?.name || "NewsAPI",
                    category: "Newspaper", publishedAt: a.publishedAt, type: "api"
                })));
            }
            if (politics.status === "fulfilled") {
                results.push(...politics.value.data.articles.map((a) => ({
                    title: a.title, url: a.url, description: a.description,
                    imageUrl: a.urlToImage, source: a.source?.name || "NewsAPI",
                    category: "Politics", publishedAt: a.publishedAt, type: "api"
                })));
            }
        }
        catch (e) { }
    }
    // 2. NewsData.io — if key available
    if (process.env.NEWSDATA_KEY) {
        try {
            const res = await axios_1.default.get(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&language=en&country=in&category=politics&size=10`);
            results.push(...res.data.results.map((a) => ({
                title: a.title, url: a.link, description: a.description,
                imageUrl: a.image_url, source: a.source_id || "NewsData",
                category: "Politics", publishedAt: a.pubDate, type: "api"
            })));
        }
        catch (e) { }
    }
    return results;
}
// ─────────────────────────────────────────────
// EXPORT MASTER FETCHER
// Runs every 15 min via newsCycleManager cron
// ─────────────────────────────────────────────
async function masterFetcher() {
    console.log("📡 [MasterFetcher] Starting parallel fetch cycle...");
    console.log(`📡 [MasterFetcher] Politics sources: ${SOURCES.rss.filter(s => s.category === "Politics").length} RSS + ${SOURCES.reddit.filter(s => s.category === "Politics").length} Reddit = ${SOURCES.rss.filter(s => s.category === "Politics").length + SOURCES.reddit.filter(s => s.category === "Politics").length}+ total`);
    const [rss, reddit, nitter, apis] = await Promise.allSettled([
        fetchRss(),
        fetchReddit(),
        fetchNitter(),
        fetchFreeApis()
    ]);
    let allRawItems = [];
    if (rss.status === "fulfilled")
        allRawItems.push(...rss.value);
    if (reddit.status === "fulfilled")
        allRawItems.push(...reddit.value);
    if (nitter.status === "fulfilled")
        allRawItems.push(...nitter.value);
    if (apis.status === "fulfilled")
        allRawItems.push(...apis.value);
    // Filter out invalid/removed items
    allRawItems = allRawItems.filter(i => i.title && i.title !== "[Removed]" && i.title.length > 10);
    // Scrape missing descriptions (only for items with short desc)
    const scrapeQueue = allRawItems.filter(i => (!i.description || i.description.length < 50) && i.url);
    await Promise.allSettled(scrapeQueue.map(async (item) => {
        const scraped = await scrapeArticleFromUrl(item.url);
        if (scraped.text)
            item.description = scraped.text;
        if (scraped.image && !item.imageUrl)
            item.imageUrl = scraped.image;
    }));
    const politicsCount = allRawItems.filter(i => i.category === "Politics").length;
    console.log(`📡 [MasterFetcher] Collected ${allRawItems.length} raw articles (${politicsCount} Politics).`);
    return allRawItems;
}
//# sourceMappingURL=masterFetcher.js.map