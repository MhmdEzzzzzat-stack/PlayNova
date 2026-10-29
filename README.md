# PlayNova

PlayNova is an Arabic-first browser gaming platform in development, designed for desktop and mobile.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS
- Cloudflare Workers using the OpenNext Cloudflare adapter

## Current status

- Responsive dark navy / violet visual system and redesigned landing page
- Arabic RTL and English LTR homepage switcher
- Working client-side search and category filters for the current preview catalog
- Accessible focus styles, reduced-motion support, and responsive mobile navigation
- Project foundation and Cloudflare Workers deployment configuration
- Game cards remain clearly marked preview placeholders; no playable games are connected yet
- Favorites, recently played history, game detail pages, legal pages, Supabase, accounts, and admin dashboard are not implemented yet

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

1. Build game detail routes and a verified, authorized playable game catalog.
2. Implement favorites and recently played with persistent storage.
3. Add dedicated search and category pages.
4. Add legal pages and contact / copyright reporting workflows.
5. Add Supabase with Row Level Security only when persistence is required.
6. Add secure admin authentication and game management.
7. Complete SEO, analytics, performance, accessibility, and monetization after real content is available.
