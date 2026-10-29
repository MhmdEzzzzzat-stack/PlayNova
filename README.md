# PlayNova

PlayNova is an Arabic-first browser gaming platform in development, designed for desktop and mobile.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS
- Cloudflare Workers using the OpenNext Cloudflare adapter

## Current status

- Responsive bilingual homepage structure with desktop/mobile navigation, search, and nine genre filters
- Arabic RTL / English LTR switching persisted in local storage
- Dedicated homepage sections for featured, popular, newest, recently played, recommendations, and genres
- Favorites persistence scaffolding using local storage and accessible favorite controls on real catalog cards
- Empty catalog states that avoid fake games or fabricated popularity metrics
- Project foundation and Cloudflare Workers deployment configuration
- Important integration gap: no published game catalog/API, play-event tracking, game detail route, legal/contact pages, or admin module exists yet; sections remain empty until those systems are implemented

## Requirements

- Node.js 20.9+
- npm

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build and Cloudflare preview

```bash
npm run lint
npm run build:cloudflare
npm run preview
```

## Deploy to Cloudflare Workers

Connect this repository to **Workers Builds** (not the static Pages upload flow). The repository includes `wrangler.jsonc` and the OpenNext adapter configuration.

For a manual deployment from an authenticated Cloudflare environment:

```bash
npm run deploy
```

## Environment variables

See `.env.example`. Add production values in Cloudflare Workers > Settings > Variables and Secrets. Never commit real credentials or expose service-role keys in browser code.

## Content and licensing

Only publish games, artwork, sounds, and embeds that are original, properly licensed, or explicitly authorized for redistribution/embedding. Do not copy another platform's games or assets without permission.

## Planned roadmap

1. Implement a published catalog API and game data model, including verified artwork, genres, publication dates, and featured flags.
2. Build game detail routes and connect authorized playable game sources.
3. Add real play-event tracking so popularity is based on recorded events, not invented values.
4. Connect favorites and recently played history to the catalog and persistent storage where appropriate.
5. Add legal pages and contact / copyright reporting workflows.
6. Add secure admin authentication and configurable homepage sections.
7. Complete SEO, analytics, performance, accessibility, and monetization after real content is available.
