const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'app');
const pages = [
  { name: 'art', category: 'Art', itemsName: 'artItems' },
  { name: 'trending', category: 'Trending', itemsName: 'trendingItems' },
  { name: 'newspaper', category: 'Newspaper', itemsName: 'newspaperItems' }
];

pages.forEach(p => {
  const filePath = path.join(pagesDir, p.name, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${p.name}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix imports
  if (!content.includes('useRef')) {
    content = content.replace(/import { useEffect, useState, useMemo } from "react"/, 'import { useEffect, useState, useMemo, useRef } from "react"');
  }

  // Fix hooks
  content = content.replace(/const { items: rssItems } = useRssStore\(\)/, 'const { items: rssItems, fetchNextPage, hasMore, fetchNews } = useRssStore()');
  
  // Add sentinel ref if not there
  if (!content.includes('const sentinelRef')) {
    content = content.replace(/const \[loading, setLoading\] = useState\(true\)/, 'const [loading, setLoading] = useState(true)\n  const sentinelRef = useRef<HTMLDivElement>(null)');
  }

  // Replace useEffect
  const useEffectRegex = /useEffect\(\(\) => \{\s*fetch\([^)]+\)\s*\.then\(\(\) => setLoading\(false\)\)\s*\.catch\(\(\) => setLoading\(false\)\)\s*\}, \[\]\)/;
  
  if (useEffectRegex.test(content)) {
    const replacement = `useEffect(() => {
    fetchNews(false, "IN", "${p.category}").then(() => setLoading(false)).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, fetchNextPage])`;
    
    content = content.replace(useEffectRegex, replacement);
  }

  // Add sentinel div
  if (!content.includes('{/* Sentinel div for infinite scroll */}')) {
    content = content.replace(/<\/div>\s*<\/div>\s*\)\s*\}\s*$/, `
        {/* Sentinel div for infinite scroll */}
        <div ref={sentinelRef} className="py-10 text-center">
          {hasMore ? (
            <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-500 rounded-full animate-spin"></div>
          ) : (
            ${p.itemsName}.length > 0 && <p className="text-zinc-500 font-sans">You're all caught up!</p>
          )}
        </div>
      </div>
    </div>
  )
}
`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${p.name}/page.tsx`);
});
