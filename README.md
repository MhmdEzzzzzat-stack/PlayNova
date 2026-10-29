# PlayNova

Modern browser gaming platform — original brand and implementation.

PlayNova is a bilingual (Arabic/English) browser gaming platform in development, designed for desktop and mobile. Game content must be original, properly licensed, or embedded with explicit authorization.

## Current status

- Initial Next.js App Router foundation
- React + TypeScript
- Tailwind CSS
- Arabic-first landing page prototype
- No database or authentication service is connected yet
- Featured cards are placeholders, not playable games

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build check

```bash
npm run build
```

## Planned phases

1. Validate the app foundation and responsive landing page.
2. Add complete Arabic RTL and English LTR localization.
3. Build the game catalog and categories.
4. Add Supabase PostgreSQL with appropriate Row Level Security.
5. Add secure administrator authentication and game management.
6. Add original/licensed/authorized games and test player behavior.
7. Deploy and verify performance, accessibility, SEO, and security.

## Environment variables

See `.env.example`. Do not commit real credentials. Never expose service-role keys to client-side code.

## Licensing policy

Do not publish game files, artwork, or embeds unless the source and usage rights have been verified.
