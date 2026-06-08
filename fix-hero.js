const fs = require('fs');
let file = 'd:/factflow/factflow-frontend/components/frontend/breaking-news-hero.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useAuthStore }')) {
  content = content.replace(/"use client"/, '"use client"\nimport { useAuthStore } from "@/store/auth-store";');
}

const oldFetch = /const r = await fetch\(`\$\{process\.env\.NEXT_PUBLIC_API_URL\}\/news\?breaking=true&limit=20`\)/;
const newFetch = `
        let r = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/news?breaking=true&limit=20&\${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}\`)
        let data = r.ok ? await r.json() : { success: false, data: [] }
        
        let allArticles = data.success && data.data ? data.data : []

        if (allArticles.length < 5) {
          const fbR = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/news?limit=10&\${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}\`)
          const fbData = fbR.ok ? await fbR.json() : null
          if (fbData && fbData.success && fbData.data) {
             const existingIds = new Set(allArticles.map(a => a._id))
             const more = fbData.data.filter(a => !existingIds.has(a._id))
             allArticles = [...allArticles, ...more].slice(0, 15)
          }
        }
`;

content = content.replace(oldFetch, newFetch);
content = content.replace(/if \(\!r\.ok\) throw new Error\("Fetch failed"\)\n\s*const data = await r\.json\(\)/, '');

const oldDisplayItems = 'const displayItems = [...items, ...items]';
const newDisplayItems = `let displayItems = [...items]\n  while (displayItems.length > 0 && displayItems.length < 8) {\n    displayItems = [...displayItems, ...items]\n  }`;

content = content.replace(oldDisplayItems, newDisplayItems);

fs.writeFileSync(file, content);
console.log("Updated breaking-news-hero.tsx");
