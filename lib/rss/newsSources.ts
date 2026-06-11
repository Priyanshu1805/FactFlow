export const NEWS_SOURCES: Record<string, Record<string, { category: string, name: string, url: string }[]>> = {
  india: {
    english: [
      { category: "Breaking", name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
      { category: "Sports", name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms" },
      { category: "Business", name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms" },
    ],
    hindi: [
      { category: "Breaking", name: "Dainik Jagran", url: "https://rss.jagran.com/rss/news/national.xml" },
      { category: "Sports", name: "Amar Ujala", url: "https://www.amarujala.com/rss/sports-news.xml" },
    ],
    marathi: [
      { category: "Breaking", name: "Loksatta", url: "https://www.loksatta.com/feed/" },
    ],
    bengali: [
      { category: "Breaking", name: "Anandabazar", url: "https://www.anandabazar.com/rss.xml" },
    ],
    tamil: [
      { category: "Breaking", name: "Dinamalar", url: "https://feeds.feedburner.com/dinamalar/Front_page_news" },
      { category: "Breaking", name: "OneIndia Tamil", url: "https://tamil.oneindia.com/rss/tamil-news-fb.xml" }
    ],
    telugu: [
      { category: "Breaking", name: "Eenadu", url: "https://www.eenadu.net/telugu-news/rss" },
      { category: "Breaking", name: "OneIndia Telugu", url: "https://telugu.oneindia.com/rss/telugu-news-fb.xml" }
    ],
    gujarati: [
      { category: "Breaking", name: "Gujarat Samachar", url: "https://www.gujaratsamachar.com/rss/top-stories" },
      { category: "Breaking", name: "OneIndia Gujarati", url: "https://gujarati.oneindia.com/rss/gujarati-news-fb.xml" }
    ],
    punjabi: [
      { category: "Breaking", name: "Jagbani", url: "https://www.jagbani.punjabkesari.in/rss/home" },
      { category: "Breaking", name: "OneIndia Punjabi", url: "https://punjabi.oneindia.com/rss/punjabi-news-fb.xml" }
    ]
  },
  us: {
    english: [
      { category: "Breaking", name: "NY Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
      { category: "Technology", name: "TechCrunch", url: "https://techcrunch.com/feed/" },
      { category: "Business", name: "WSJ", url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml" },
      { category: "Trending", name: "E! Online", url: "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml" },
      { category: "Trending", name: "TMZ", url: "https://www.tmz.com/rss.xml" }
    ]
  },
  uk: {
    english: [
      { category: "Breaking", name: "BBC News", url: "http://feeds.bbci.co.uk/news/rss.xml" },
      { category: "Sports", name: "Sky Sports", url: "https://www.skysports.com/rss/12040" },
      { category: "Trending", name: "Daily Mail Showbiz", url: "https://www.dailymail.co.uk/tvshowbiz/index.rss" },
    ]
  },
  ca: {
    english: [
      { category: "Breaking", name: "CBC", url: "https://www.cbc.ca/cmlink/rss-topstories" },
      { category: "Breaking", name: "Global News", url: "https://globalnews.ca/feed/" }
    ]
  },
  au: {
    english: [
      { category: "Breaking", name: "ABC News", url: "https://www.abc.net.au/news/feed/51120/rss.xml" },
      { category: "Breaking", name: "News.com.au", url: "https://www.news.com.au/content-feeds/latest-news-national/" }
    ]
  },
  fr: {
    french: [
      { category: "Breaking", name: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml" },
      { category: "Breaking", name: "France 24", url: "https://www.france24.com/fr/rss" }
    ],
    english: [
      { category: "Breaking", name: "France 24 (EN)", url: "https://www.france24.com/en/rss" },
      { category: "Breaking", name: "Le Monde (EN)", url: "https://www.lemonde.fr/en/rss/une.xml" }
    ]
  },
  de: {
    german: [
      { category: "Breaking", name: "Spiegel", url: "https://www.spiegel.de/schlagzeilen/tops/index.rss" },
      { category: "Breaking", name: "DW News", url: "https://rss.dw.com/xml/rss-de-all" }
    ],
    english: [
      { category: "Breaking", name: "DW News (EN)", url: "https://rss.dw.com/xml/rss-en-all" },
      { category: "Breaking", name: "Spiegel (EN)", url: "https://www.spiegel.de/international/index.rss" }
    ]
  },
  jp: {
    japanese: [
      { category: "Breaking", name: "Yahoo Japan", url: "https://news.yahoo.co.jp/rss/topics/top-picks.xml" }
    ],
    english: [
      { category: "Breaking", name: "Japan Times", url: "https://www.japantimes.co.jp/feed/" },
      { category: "Breaking", name: "NHK World", url: "https://www3.nhk.or.jp/nhkworld/upld/medias/en/radio/news/podcast.xml" }
    ]
  },
  br: {
    portuguese: [
      { category: "Breaking", name: "G1", url: "https://g1.globo.com/rss/g1/" },
      { category: "Breaking", name: "Folha", url: "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml" }
    ],
    english: [
      { category: "Breaking", name: "Rio Times", url: "https://www.riotimesonline.com/feed/" }
    ]
  },
  ae: {
    arabic: [
      { category: "Breaking", name: "Al Khaleej", url: "https://www.alkhaleej.ae/rss" }
    ],
    english: [
      { category: "Breaking", name: "Gulf Business", url: "https://gulfbusiness.com/feed/" },
      { category: "Breaking", name: "BBC Middle East", url: "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
      { category: "Breaking", name: "Al Jazeera ME", url: "https://www.aljazeera.com/xml/rss/all.xml" }
    ]
  },
  za: {
    english: [
      { category: "Breaking", name: "News24", url: "https://feeds.news24.com/articles/news24/SouthAfrica/rss" },
      { category: "Breaking", name: "IOL", url: "https://www.iol.co.za/rss" }
    ]
  },
  global: {
    english: [
      { category: "Breaking", name: "Reuters", url: "https://feeds.reuters.com/reuters/topNews" },
      { category: "Breaking", name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
      { category: "Breaking", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
      { category: "Breaking", name: "NY Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
      { category: "Technology", name: "BBC Tech", url: "http://feeds.bbci.co.uk/news/technology/rss.xml" },
      { category: "Sports", name: "Sky Sports", url: "https://www.skysports.com/rss/12040" },
      { category: "Trending", name: "TMZ", url: "https://www.tmz.com/rss.xml" },
      { category: "Trending", name: "People", url: "https://people.com/feed/" },
      { category: "Lifestyle", name: "Vogue", url: "https://www.vogue.com/feed/rss" }
    ]
  }
}
