import axios from 'axios';

// Reddit public JSON API — completely free, no key needed, works forever
// URL pattern: https://www.reddit.com/r/{sub}/top.json?limit=25&t=day

const REDDIT_SOURCES = [
  { subreddit: 'india',            section: 'Newspaper' },
  { subreddit: 'worldnews',        section: 'World' },
  { subreddit: 'bollywood',        section: 'Art'       },
  { subreddit: 'Cricket',          section: 'Sports'    },
  { subreddit: 'soccer',           section: 'Sports'    },
  { subreddit: 'technology',       section: 'Tech'      },
  { subreddit: 'artificial',       section: 'Tech'      },
  { subreddit: 'IndianFood',       section: 'Lifestyle' },
  { subreddit: 'travel',           section: 'Lifestyle' },
  { subreddit: 'movies',           section: 'Art'       },
  { subreddit: 'Music',            section: 'Art'       },
  { subreddit: 'politics',         section: 'Politics'  },
  { subreddit: 'IndiaSpeaks',      section: 'Politics'  },
  { subreddit: 'mildlyinteresting',section: 'Trending'  },
  { subreddit: 'interestingasfuck',section: 'Trending'  },
  { subreddit: 'todayilearned',    section: 'Trending'  },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now() + Math.floor(Math.random() * 1000);
}

export async function fetchAllReddit(): Promise<any[]> {
  const allArticles: any[] = [];

  const promises = REDDIT_SOURCES.map(async (source) => {
    try {
      const response = await axios.get(`https://www.reddit.com/r/${source.subreddit}/top.json?limit=25&t=day`, {
        headers: { 'User-Agent': 'FactFlow/1.0' }
      });

      const posts = response.data?.data?.children || [];

      for (const post of posts) {
        const d = post.data;
        if (!d || d.is_video || d.over_18 || !d.title) continue;

        let imageUrl = d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : '';
        if (!imageUrl && d.preview?.images?.[0]?.source?.url) {
          imageUrl = d.preview.images[0].source.url.replace(/&amp;/g, '&');
        }

        if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop";
        }

        allArticles.push({
          title: d.title.substring(0, 200),
          excerpt: (d.selftext || d.title).substring(0, 300),
          content: d.selftext || d.title,
          category: source.section,
          image: imageUrl,
          author: `u/${d.author}`,
          publishedAt: new Date(d.created_utc * 1000),
          source: `Reddit r/${source.subreddit}`,
          sourceUrl: `https://reddit.com${d.permalink}`,
          slug: generateSlug(d.title), // Pre-generate slug for insertMany
          sections: [source.section],
          primarySection: source.section,
          classifiedBy: 'reddit_source',
          classifiedAt: new Date()
        });
      }
    } catch (err: any) {
      console.warn(`[Reddit] Failed to fetch r/${source.subreddit}:`, err.message);
    }
  });

  await Promise.allSettled(promises);
  return allArticles;
}
