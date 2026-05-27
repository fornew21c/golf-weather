# ⛳️ Golf Weather

A premium, mobile-first web app for checking the weather at **Korean golf
courses**. Search a course by name and instantly see current conditions, an
hourly + weekly forecast, a 0–100 **golf playability score**, a locally
generated round summary, and a clothing recommendation.

> Search and geocoding are **restricted to South Korea**. The app ships with a
> curated list of well-known Korean courses and ships realistic **mock weather**
> so the full UI works with **zero API keys**.

---

## ✨ Features

- **Korea-only golf course search** with debounced autocomplete (Kakao Local or
  Google Places, plus an instant curated list).
- **Weather**: current conditions, 24-hour forecast, 7-day forecast — temp,
  feels-like, humidity, wind, precipitation probability, UV index,
  sunrise/sunset.
- **Golf Condition Score (0–100)** from rain, wind, temperature and humidity,
  with a per-factor breakdown, color indicator and emoji.
- **Rule-based round summary** — natural-language, generated locally (no
  external AI).
- **Clothing & gear recommendation** based on feels-like temp, wind and rain.
- **Premium UI/UX**: dark/light mode, glassmorphism, soft shadows, gradients,
  smooth animations, sticky mobile search, responsive cards, loading skeletons,
  empty + error states.
- **Performance**: debounced search, server + client weather caching, lazy-loaded
  chart bundle.
- **SEO**: per-course metadata, OpenGraph, `sitemap.xml`, `robots.txt`.
- **Accessibility**: keyboard-navigable combobox, ARIA roles, reduced-motion
  support.

---

## 🧱 Tech Stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 14 (App Router) + TypeScript    |
| Styling        | Tailwind CSS + shadcn/ui design system  |
| Icons          | lucide-react                            |
| Data fetching  | TanStack React Query                    |
| Charts         | Recharts (lazy-loaded)                  |
| Weather        | OpenWeather One Call API 3.0            |
| Geocoding      | Kakao Local API **or** Google Places    |
| Theme          | next-themes                             |
| Deploy         | Vercel-ready                            |

---

## 📁 Folder Structure

```
golf-weather/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, SEO metadata, providers
│   │   ├── globals.css             # Tailwind layers + light/dark design tokens
│   │   ├── providers.tsx           # React Query + theme providers (client)
│   │   ├── page.tsx                # Home: hero, highlights, featured courses
│   │   ├── not-found.tsx           # 404 state
│   │   ├── error.tsx               # Global error boundary
│   │   ├── robots.ts / sitemap.ts  # SEO
│   │   ├── course/[id]/page.tsx    # Detail route (SSR metadata + static params)
│   │   └── api/
│   │       ├── search/route.ts     # GET /api/search?q=  (Korea-only geocode)
│   │       └── weather/route.ts    # GET /api/weather?lat=&lon=
│   ├── components/
│   │   ├── ui/                      # shadcn-style primitives (button, card, …)
│   │   ├── weather/                 # Detail-page weather components + charts
│   │   ├── search-bar.tsx           # Autocomplete combobox
│   │   ├── hero.tsx, site-header.tsx, course-card.tsx, featured-courses.tsx
│   │   └── theme-provider.tsx / theme-toggle.tsx
│   ├── hooks/
│   │   ├── use-debounce.ts          # Generic debounce
│   │   ├── use-search.ts            # Debounced course search query
│   │   └── use-weather.ts           # Weather query (10-min cache)
│   └── lib/
│       ├── types.ts                 # Normalized domain types
│       ├── utils.ts                 # cn(), formatters, icon helpers
│       ├── courses.ts               # Curated Korean courses + local search
│       ├── geocode.ts               # Kakao / Google geocoding (Korea-bounded)
│       ├── weather-api.ts           # OpenWeather client + mock fallback
│       ├── mock-data.ts             # Deterministic realistic mock weather
│       ├── golf-score.ts            # 0–100 playability score
│       ├── summary.ts               # Rule-based round summary
│       └── clothing.ts              # Clothing recommendation
├── .env.example
├── tailwind.config.ts / postcss.config.mjs
├── next.config.mjs / tsconfig.json
└── package.json
```

**Architecture notes**

- `lib/` is pure, framework-agnostic logic (typed inputs → typed outputs), so
  scoring/summary/clothing are unit-testable and reusable.
- Provider responses are **normalized** in `weather-api.ts`/`geocode.ts`, so the
  UI never depends on OpenWeather/Kakao/Google response shapes.
- API keys live **server-side only** (API routes), never shipped to the browser.

---

## 🔌 API Setup

All keys are optional — without them the app serves realistic mock data.

1. Copy the env template:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in the keys you have:

   | Variable               | Provider      | Used for                                  |
   | ---------------------- | ------------- | ----------------------------------------- |
   | `OPENWEATHER_API_KEY`  | OpenWeather   | current / hourly / daily weather (One Call 3.0) |
   | `KAKAO_REST_API_KEY`   | Kakao Local   | Korean course → coordinates (preferred)   |
   | `GOOGLE_PLACES_API_KEY`| Google Places | geocoding fallback (`region=kr`)          |
   | `NEXT_PUBLIC_SITE_URL` | —             | canonical URLs / SEO metadata             |

   - **OpenWeather**: create an account → subscribe to *One Call API 3.0*
     (free tier available) → copy the key. If the subscription is missing the
     app automatically falls back to mock data.
   - **Kakao**: https://developers.kakao.com → create an app → use the
     **REST API key**. Kakao Local returns Korean results natively.
   - **Google Places** (alternative): enable *Places API* in Google Cloud and
     create an API key. Results are constrained to a Korea bounding box.

> Geocoding always discards any result outside the South Korea bounding box, so
> search stays Korea-only regardless of provider.

---

## 🚀 Run Locally

Requires **Node.js 18.18+**.

```bash
# 1. install dependencies
npm install

# 2. (optional) add API keys
cp .env.example .env.local

# 3. start the dev server
npm run dev
# → http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## ▲ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com/new), **Import** the repository. The framework
   preset auto-detects **Next.js** (build: `next build`, output handled
   automatically).
3. Add Environment Variables (Project → Settings → Environment Variables) for
   Production/Preview:
   - `OPENWEATHER_API_KEY`
   - `KAKAO_REST_API_KEY` *(or)* `GOOGLE_PLACES_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your production URL (e.g. `https://golf-weather.vercel.app`)
4. **Deploy**. Curated course pages are statically pre-rendered; weather is
   fetched/cached at runtime via the API routes.

Deploy from the CLI instead:

```bash
npm i -g vercel
vercel            # preview deploy
vercel --prod     # production deploy
```

---

## 🧮 How the Golf Score Works

Four factors, each scored 0–100 (higher = better) then weighted:

| Factor   | Weight | Ideal                       |
| -------- | ------ | --------------------------- |
| Rain     | 35%    | 0% precipitation probability|
| Wind     | 30%    | ≤ 2 m/s                     |
| Temp     | 20%    | 16–24 °C                    |
| Humidity | 15%    | ≤ 55%                       |

Rating bands: **90+ Excellent · 70+ Good · 50+ Playable · <50 Tough Conditions**.

---

Built with Next.js. Weather data © OpenWeather.
