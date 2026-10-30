# Prompt 10 — Analytics, performance, reliability acceptance plan

## Event pipeline
- Migration: `0005_analytics.sql` (apply after migrations 0001–0004).
- First-party ingestion: `POST /api/analytics/events`.
- Client events are sent only after explicit consent. A random browser session ID is kept locally; only its SHA-256 hash is stored. No IP address, account email, full referrer URL, password, token, raw error message, or stack trace is sent to analytics.
- Event IDs are unique in D1; duplicate retries use `INSERT OR IGNORE`.
- Events are capped and allowlisted. Page views, search terms/result counts, game starts, iframe load signals, favorites, category visits, page duration, device class, and Web Vitals are recorded where measurable.
- Search results are currently empty because the published catalog/search integration is not connected. Search no-result reports reflect the current user-visible search behavior, not inferred popularity.
- An iframe load event only means the browser fired the iframe load event. It does not prove the embedded game initialized or became playable.
- Return visits are not reported because a reliable consented cross-visit measurement has not been implemented.

## Privacy and retention
- Visitors can grant or refuse analytics and reopen the privacy settings control later.
- Analytics endpoint rejects events without consent header and rejects cross-origin submissions.
- Anonymous session identifiers are random and hashed before storage.
- Retention policy is 90 days. Owner/administrator can run a controlled cleanup from the dashboard; deletion is irreversible.
- Traffic source stores only referring hostname, never full URL/query.
- Do not use analytics counts as player counts or revenue.

## Performance
- Homepage thumbnails use responsive lazy loading and async Next Image rendering. `unoptimized` is set to avoid assuming a paid image optimizer; actual resized variants are not generated.
- Game iframes load only after a deliberate Start action and are lazy-loaded.
- Web Vitals LCP, CLS, INP, FCP and TTFB are observed when the browser supports them and consent is granted.
- Cloudflare Worker Observability is enabled. Next request errors are logged with sanitized route/method/error name only; inspect Cloudflare logs for server-side diagnostics.
- D1 indexes support date, event type, game and session aggregations. Queries taking 250 ms or more emit a sanitized slow-query diagnostic (operation label and duration, no bound values) to Cloudflare Worker Observability logs.

## Required staging verification
1. With no consent, browse, search, visit a category, favorite a game and start a game: verify no rows are added to analytics_events.
2. Grant consent; repeat the above and verify events arrive in D1 and dashboard counts update after refresh.
3. POST the same eventId twice; verify only one row is stored and second response reports duplicate=true.
4. Submit from another origin or without consent; verify 403 and no row.
5. Send malformed event type, invalid UUID, invalid duration, metric and date filter; verify 400 or safe empty filter behavior.
6. Simulate blocked iframe and 20-second timeout; verify categorized failure events. A normal iframe load is labeled as a load signal only.
7. Make the analytics endpoint unavailable in staging; verify the game UI still works and the client silently drops analytics errors.
8. Compare selected date filters against direct D1 queries, including midnight boundaries.
9. Check mobile and desktop devices separately; test throttled Slow 3G / low-end CPU in browser DevTools and record Web Vitals.
10. Trigger a controlled server exception in staging; verify sanitized diagnostic appears in Cloudflare Worker Observability logs, without query strings or stack traces.
11. Run retention cleanup in staging and confirm only events older than 90 days are deleted.

## Cost notes
- This is first-party D1 event storage, not an unlimited analytics free tier. D1 storage, query volume, Worker requests, and observability log retention are subject to the Cloudflare plan and current quotas.
- Avoid high-frequency interaction events. Current client sends only meaningful actions and one set of Web Vitals on page exit.
- No external analytics vendor or paid monitoring service is assumed.
