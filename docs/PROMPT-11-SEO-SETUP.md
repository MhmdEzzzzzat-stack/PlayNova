# Prompt 11 — Technical SEO and Google Search setup

## Implemented
- Canonical production origin helper. Default is `https://playnova.mzt112006mzt.workers.dev`; set `NEXT_PUBLIC_SITE_URL` to the final verified custom domain before launch.
- Bilingual homepage is server-rendered according to `?lang=ar` or `?lang=en`; language switching updates the URL.
- Published games are loaded from D1 on the server and shown on the homepage and category pages. Game detail content is server-rendered and crawlable.
- Game and category URLs retain the same stable slug and expose Arabic/English variants using explicit `lang` query parameters.
- Self-referencing canonical URLs and reciprocal `hreflang` values are emitted for Arabic, English, and `x-default`.
- Publishing now requires a substantive Arabic and English description (at least 40 characters), useful instructions and controls in both languages, and at least one category. Public pages also exclude records with expired authorization dates.\n- Unique localized titles/descriptions are generated from approved game metadata and curated category descriptions.
- Open Graph and Twitter metadata are emitted; game thumbnails are used only when a verified thumbnail exists.
- `VideoGame` structured data uses actual title, description, language, categories and optional verified image. `BreadcrumbList` reflects visible navigation. No reviews, aggregate ratings, offers or fake popularity are generated.
- Breadcrumb navigation and internal links connect games, categories, and related games.
- `/sitemap.xml` is generated from published, license-approved, active games and categories that contain those games. Both language variants are included. No drafts or suspended games.
- `/robots.txt` allows public pages and disallows administrative, API, favorites, recent-history and internal search routes.
- Admin pages receive `noindex,nofollow`; favorites/recent/search remain noindex.
- Empty category pages are noindex and omitted from the sitemap. Search URLs are not indexed.
- Homepage game thumbnails and category thumbnails have descriptive alt text; Next Image lazy loading remains in use.
- Added unit tests for canonical language URLs, reciprocal hreflang and safe JSON-LD escaping.

## Current catalog limitation
The D1 catalog must contain genuinely published, licensed, active games with complete Arabic and English metadata. Candidate/draft games are excluded. A category with no published games is deliberately not indexed. No rankings or traffic are guaranteed.

## External setup before launch
1. Confirm the final production domain and set Worker build variable `NEXT_PUBLIC_SITE_URL` to its HTTPS origin (no trailing slash).
2. In Google Search Console, add the exact domain property or URL-prefix property. Complete DNS TXT verification (preferred for a domain property) or use the HTML meta verification token by setting `GOOGLE_SITE_VERIFICATION` in Cloudflare Workers environment variables.
3. Deploy the reviewed build, then open `https://YOUR-DOMAIN/robots.txt` and `https://YOUR-DOMAIN/sitemap.xml`.
4. In Search Console, submit `sitemap.xml`, inspect the homepage and a real published game URL, and request indexing where appropriate.
5. Check Page Indexing, Sitemaps, HTTPS, Core Web Vitals and Manual Actions reports regularly. Fix errors before requesting re-crawl.
6. Validate a real published game URL with Google's Rich Results Test and Schema Markup Validator. Structured data eligibility does not guarantee a rich result.
7. Verify both Arabic and English versions render the correct server HTML, canonical and hreflang links. Do not submit empty/draft/suspended pages.

## Release gates and limitations
- Do not set `NEXT_PUBLIC_SITE_URL` to a preview URL or temporary Workers deployment if a permanent custom domain is selected.
- The current app uses `?lang=ar|en` rather than separate `/ar/` and `/en/` path prefixes. Canonical and hreflang values consistently use this existing route structure.
- Image URLs are served as existing approved assets; this change does not generate WebP/AVIF variants or resize originals. Next Image lazy loading and descriptive alt text are retained, but the image endpoint remains unoptimized.
- Sitemap generation queries D1 at request time and therefore requires the D1 binding and migrations to be correctly configured in the deployed Worker.
- Search Console ownership, sitemap submission, crawl validation and indexing are external actions and are not performed by this code change.
