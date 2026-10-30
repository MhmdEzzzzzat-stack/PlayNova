# Prompt 9 — Asset storage setup and release checklist

## Temporary no-R2 deployment mode
- The deployment configuration currently omits the `ASSETS_BUCKET` binding so the Worker can deploy without activating paid-billing storage.
- Admin asset uploads, approvals, and deletions return HTTP 503 with an explanatory message while storage is unavailable. The asset inventory remains readable.
- Public asset delivery is unavailable until a storage provider is configured. Existing asset metadata in D1 is preserved; no migration or database deletion is performed.
- Re-enable storage only after selecting a provider, configuring its binding, and testing it in staging.


## Storage provider
This branch uses Cloudflare R2 through the Worker binding `ASSETS_BUCKET`. The configured bucket name is `playnova-assets`. Uploaded bytes stay in R2; D1 stores metadata, hashes, review state, and byte counts.

Before enabling uploads:
1. Create the R2 bucket in the same Cloudflare account as the PlayNova Worker (Cloudflare Dashboard → R2 → Create bucket) named exactly `playnova-assets`, or run `npx wrangler r2 bucket create playnova-assets` from an authenticated project checkout.
2. Deploy the Worker with the R2 binding in `wrangler.jsonc`.
3. Apply database migrations in order, including `0004_content_assets.sql`. Do not apply until the migration set has been reviewed and the database backed up.
4. Test uploads in a staging Worker/bucket first.

## Current upload policy
- JPG/JPEG, PNG, WebP raster images only; max 8 MiB.
- ZIP packages only; max 50 MiB compressed, 500 entries, 150 MiB expanded, maximum 100:1 expansion ratio.
- ZIP entries must have safe relative paths, supported compression, matching local/central headers, no encryption or symlinks, unique names, and root `index.html`.
- SHA-256 duplicate detection is scoped by game and asset type.
- All uploaded assets start as `pending_review`; only approved raster images can be served by the app.
- Package upload and approval require owner/administrator plus a game with approved license, authorization reference, and HTTPS evidence URL.
- Rejected/pending orphan assets with no game reference and older than 30 days can be cleaned in batches of 100.

## Not enabled / not claimed
- No antivirus or malware scanning engine is configured.
- ZIP packages are validated and stored, but are not extracted, executed, or published as playable games.
- A separate isolated game origin and secure package extraction/deployment pipeline must be designed and configured before enabling hosted HTML5 execution. Never serve package HTML/JS from the primary PlayNova origin.
- Image resizing/optimized variants are not generated in this implementation.
- Storage usage is an inventory estimate from D1 metadata, not a live R2 billing metric; bandwidth/egress tracking is not implemented.

## Release checks
- Configure and verify R2 binding in the actual Cloudflare Worker environment.
- Apply migrations in order after approval.
- Run `npm test`, `npm run lint`, and `npm run build:cloudflare`.
- Execute the manual failure-injection steps in `tests/ASSET_UPLOAD_TEST_PLAN.md`.
- Verify no ZIP content is publicly executable and no unapproved asset can be fetched.
