import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const res = await fetch('http://static.cricinfo.com/rss/livescores.xml', { 
        cache: 'no-store',
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    });
    
    if (!res.ok) throw new Error("Failed to fetch RSS");
    
    const xml = await res.text();
    
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g;
    let match;
    const matches: { title: string, link: string }[] = [];

    while ((match = itemRegex.exec(xml)) !== null) {
      matches.push({ title: match[1].trim(), link: match[2].trim() });
    }

    if (matches.length === 0) {
      return NextResponse.json({ success: false, message: 'No live matches found' });
    }

    // Sort to prioritize India matches
    matches.sort((a, b) => {
      const aInd = a.title.toLowerCase().includes('india') || a.title.toLowerCase().includes('ind ');
      const bInd = b.title.toLowerCase().includes('india') || b.title.toLowerCase().includes('ind ');
      if (aInd && !bInd) return -1;
      if (!aInd && bInd) return 1;
      return 0;
    });

    const parseTeam = (str: string) => {
      const scoreRegex = /\s+((?:\d+[\d/*&amp;\s]*)+)$/;
      const m = str.match(scoreRegex);
      if (m) {
          const score = m[1].replace(/&amp;/g, '&').trim();
          const name = str.replace(m[1], '').trim();
          return { name, score };
      }
      return { name: str, score: 'Yet to bat' };
    };

    const parsedMatches = matches.map(matchObj => {
      let rawTitle = matchObj.title;
      let matchResult = "";
      let cleanMatch = rawTitle;

      const resultRegex = /-(.*?won by.*?|.*?drawn.*?|.*?tied.*?|.*?abandoned.*?|.*?no result.*?)$/i;
      const resultMatch = rawTitle.match(resultRegex);
      if (resultMatch) {
        matchResult = resultMatch[1].trim();
        cleanMatch = rawTitle.replace(resultRegex, '').trim();
      }

      const parts = cleanMatch.split(' v ');
      if (parts.length >= 2) {
        const team1 = parseTeam(parts[0].trim());
        const team2 = parseTeam(parts[1].trim());
        let status = 'Live';

        if (team1.score === 'Yet to bat' && team2.score === 'Yet to bat') {
           status = 'Upcoming Match';
           team1.score = '-';
           team2.score = '-';
        } else if (matchResult || (!rawTitle.includes('*') && (team1.score.includes('10') || team2.score.includes('10')))) {
           status = 'Match Complete';
        }

        if (team1.score === 'Yet to bat') team1.score = '-';
        if (team2.score === 'Yet to bat') team2.score = '-';

        return { team1, team2, matchResult, status, match: rawTitle, link: matchObj.link };
      }
      return { team1: null, team2: null, matchResult: "", status: "Update", match: rawTitle, link: matchObj.link };
    }).filter(m => m.team1 !== null);

    if (parsedMatches.length === 0) {
      return NextResponse.json({ success: false, message: 'No parsable matches found' });
    }

    // Bypass RSS lag by fetching the actual HTML page for the top 5 matches to get real-time results instantly
    await Promise.all(parsedMatches.slice(0, 5).map(async (m) => {
       try {
         const pageRes = await fetch(m.link, { cache: 'no-store' });
         if (pageRes.ok) {
           const html = await pageRes.text();
           const htmlTitleMatch = html.match(/<title>(.*?)<\/title>/);
           if (htmlTitleMatch) {
             const htmlTitle = htmlTitleMatch[1];
             const wonByMatch = htmlTitle.match(/(.*?won by.*?|.*?drawn.*?|.*?tied.*?)(?:,|-|\|)/i) || htmlTitle.match(/(.*?won by.*?|.*?drawn.*?|.*?tied.*?)$/i);
             if (wonByMatch) {
               m.matchResult = wonByMatch[1].trim();
               m.status = 'Match Complete';
               m.match = m.match.replace(/\*/g, ''); // remove the 'Live' asterisk
             }
           }
         }
       } catch(e) {}
    }));

    const primaryMatch = parsedMatches[0];

    return NextResponse.json({
      success: true,
      match: primaryMatch.match,
      matchResult: primaryMatch.matchResult,
      team1: primaryMatch.team1,
      team2: primaryMatch.team2,
      status: primaryMatch.status,
      allMatches: parsedMatches
    });

  } catch (error: any) {
    console.error("Cricket API Error:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
