import { Request, Response } from 'express';
import { NewsArticle } from '../../models/NewsArticle';

// GET /api/news/home-balanced
export async function getHomeBalanced(req: Request, res: Response) {
  try {
    const sections = ['live','newspaper','politics','lifestyle','sports','tech','art','trending'];
    
    const results = await Promise.all(
      sections.map(s =>
        NewsArticle.find({ sections: { $in: [s] } })
          .sort({ qualityScore: -1, publishedAt: -1 })
          .limit(5)
          .lean()
      )
    );
    
    const flatResults = results.flat().sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.json({ success: true, data: flatResults });
  } catch (error: any) {
    console.error('Home balanced error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
