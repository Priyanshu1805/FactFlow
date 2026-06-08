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
  if (content.includes('"use client"')) {
    // Remove all instances of "use client" (and optional semicolons/newlines)
    content = content.replace(/"use client";?\n?/g, '');
    content = content.replace(/'use client';?\n?/g, '');
    // Prepend "use client"
    content = '"use client"\n' + content;
    fs.writeFileSync(f, content);
    console.log('Fixed "use client" in ' + f);
  }
});
