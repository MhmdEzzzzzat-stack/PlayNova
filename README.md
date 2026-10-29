# PlayNova

PlayNova is an Arabic-first browser gaming platform in development, designed for desktop and mobile.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS
- Cloudflare Workers using the OpenNext Cloudflare adapter

## Current status

- Responsive Arabic-first landing page
- Project foundation and Cloudflare deployment configuration
- Game cards are placeholders; playable games are not connected yet
- Supabase, accounts, and admin dashboard are not configured yet

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

1. Finish responsive Arabic and English layouts.
2. Build a searchable game catalog and category pages.
3. Add only verified, authorized playable games.
4. Add Supabase database with Row Level Security.
5. Add secure admin authentication and game management.
6. Add SEO, analytics, performance, accessibility, and monetization after real content is available.
