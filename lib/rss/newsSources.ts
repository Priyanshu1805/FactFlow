export const NEWS_SOURCES: Record<string, Record<string, { category: string, name: string, url: string }[]>> = {
  india: {
    english: [
      { category: "breaking", name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
      { category: "sports", name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms" },
      { category: "business", name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms" },
    ],
    hindi: [
      { category: "breaking", name: "Dainik Jagran", url: "https://rss.jagran.com/rss/news/national.xml" },
      { category: "sports", name: "Amar Ujala", url: "https://www.amarujala.com/rss/sports-news.xml" },
    ],
    marathi: [
      { category: "breaking", name: "Loksatta", url: "https://www.loksatta.com/feed/" },
    ],
    bengali: [
      { category: "breaking", name: "Anandabazar", url: "https://www.anandabazar.com/rss.xml" },
    ]
  },
  us: {
    english: [
      { category: "breaking", name: "NY Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
      { category: "technology", name: "TechCrunch", url: "https://techcrunch.com/feed/" },
      { category: "business", name: "WSJ", url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml" },
    ]
  },
  uk: {
    english: [
      { category: "breaking", name: "BBC News", url: "http://feeds.bbci.co.uk/news/rss.xml" },
      { category: "sports", name: "Sky Sports", url: "https://www.skysports.com/rss/12040" },
    ]
  },
  global: {
    english: [
      { category: "breaking", name: "Reuters", url: "https://www.reutersagency.com/feed/" },
    ]
  }
}
