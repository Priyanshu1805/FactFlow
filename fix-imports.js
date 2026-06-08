const fs = require('fs');
const files = [
  'app/tech/page.tsx',
  'app/sports/page.tsx',
  'app/politics/page.tsx',
  'app/lifestyle/page.tsx',
  'app/memes/page.tsx',
  'app/newspaper/page.tsx',
  'app/trending/page.tsx',
  'components/frontend/newspaper-section.tsx',
  'components/frontend/breaking-news-hero.tsx',
  'components/frontend/related-news.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('import { useAuthStore }')) {
    content = 'import { useAuthStore } from "@/store/auth-store";\n' + content;
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
