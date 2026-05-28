# Fact Flow — Frontend

Next.js 16 frontend for the Fact Flow news platform.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **3D Hero**: Three.js + React Three Fiber
- **Icons**: Lucide React
- **State**: Zustand
- **Data Fetching**: SWR
- **Language**: TypeScript

---

## Project Structure

```
factflow-frontend/
├── app/
│   ├── layout.tsx          ← Root layout with ThemeProvider
│   ├── page.tsx            ← Home page
│   ├── login/page.tsx      ← Login / Sign Up page
│   └── settings/page.tsx   ← Settings page
│
├── components/
│   ├── theme-provider.tsx  ← Global theme context (dark/light/glass)
│   └── frontend/
│       ├── navbar.tsx          ← Top navigation bar
│       ├── hero-content.tsx    ← Hero section text + CTA
│       ├── hero-3d-screen.tsx  ← Animated 3D element
│       ├── news-ticker.tsx     ← Live scrolling news bar
│       ├── trending-section.tsx← Trending news cards
│       ├── reels-section.tsx   ← Horizontal reels feed
│       ├── ai-news-section.tsx ← AI & Tech news section
│       ├── home-page.tsx       ← Main page assembler
│       └── footer.tsx          ← Site footer
│
├── lib/
│   └── utils.ts            ← Tailwind class helper
│
└── public/
    └── images/
        ├── logo-ff.jpeg    ← Favicon/small logo
        └── logo-main.jpeg  ← Main logo
```

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set environment variables (optional)

```bash
cp .env.example .env.local
```

Add your backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

---

## Theme System

Three themes available:
- **dark** — Black background (default)
- **light** — White background
- **glass** — Glassmorphism effect

Theme is stored in `localStorage` and applied via `ThemeProvider`.

---

## Connecting to Backend

Replace the mock data in sections with real API calls:

```tsx
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const { data } = useSWR(
  `${process.env.NEXT_PUBLIC_API_URL}/news?featured=true`,
  fetcher
)
```

---

## Deployment

Deploy to **Vercel** (recommended for Next.js):

```bash
npx vercel
```
