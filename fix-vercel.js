const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
  console.log('Fixed', path);
}

// 1. Fix subscription/page.tsx
replaceFile('app/subscription/page.tsx', (c) => {
  return c
    .replace(/sub\.plan === "pro"/g, 'sub.plan === "monthly"')
    .replace(/sub\.plan === "premium"/g, 'sub.plan === "yearly"')
    .replace(/minPlan: "pro"/g, 'minPlan: "monthly"')
    .replace(/minPlan: "premium"/g, 'minPlan: "yearly"')
    .replace(/minPlan === "pro" \? "Pro" : "Premium"/g, 'minPlan === "monthly" ? "Monthly" : "Yearly"')
    .replace(/const planOrder = \["free", "pro", "premium"\]/g, 'const planOrder = ["free", "weekly", "monthly", "yearly"]')
    .replace(/demoSetPlan\("pro"\)/g, 'demoSetPlan("monthly")')
    .replace(/demoSetPlan\("premium"\)/g, 'demoSetPlan("yearly")')
    .replace(/"Set → Pro"/g, '"Set → Monthly"')
    .replace(/"Set → Premium"/g, '"Set → Yearly"');
});

// 2. Fix enableAudioNews in sections
const sections = ['lifestyle', 'politics', 'sports', 'tech', 'trending'];
sections.forEach(sec => {
  replaceFile('components/frontend/' + sec + '-section.tsx', (c) => {
    return c.replace(/settings\?\.enableAudioNews/g, '((settings as any)?.enableAudioNews)')
            .replace(/settings\.enableAudioNews/g, '((settings as any).enableAudioNews)');
  });
});

// 3. Fix feed-settings.tsx
replaceFile('components/frontend/settings/feed-settings.tsx', (c) => {
  return c.replace(/setHiddenSources\(Array\.from\(checked\)\)/g, 'setHiddenSources(Array.from(checked) as string[])')
          .replace(/setHiddenCategories\(Array\.from\(checked\)\)/g, 'setHiddenCategories(Array.from(checked) as string[])');
});
