# Prompt 12 — Monetization setup and release gates

## Implemented architecture
- D1 migration `0006_monetization.sql` adds feature gates, five fixed placement IDs, deduplicated ad request/impression/click event storage, and a revenue-import ledger.
- Every feature and placement defaults to disabled. Display slots render nothing unless the operator has explicitly asserted provider approval/configuration in Worker environment variables, the feature is enabled in D1, and the placement is enabled.
- Admin controls: `/admin/monetization` (administrator/owner only), with audit logging.
- No ad network JavaScript, gaming SDK, tracking pixel, or third-party ad request is bundled or loaded by this change.
- No ad is injected into a game iframe. The existing reserved game slot is not an ad SDK integration.
- No revenue is estimated or fabricated. Revenue remains unavailable until a verified provider report importer is built.
- Sponsored placements are a governance flag only; no sponsored-game ranking or paid listing is activated by this change.

## Worker configuration
Set these only after receiving written provider approval and completing provider setup:
- `ADS_PROVIDER_NAME`: approved provider identifier (informational).
- `ADS_PROVIDER_APPROVED=true`: operator attestation that the provider approved this property/account and use case.
- `ADS_PROVIDER_CONFIGURED=true`: operator attestation that required publisher IDs, consent integration, and domain/site configuration are complete.
- `GAME_ADS_PROVIDER_APPROVED=true` and `GAME_ADS_PROVIDER_CONFIGURED=true`: only after a specific official gaming SDK agreement and per-game permissions are verified.

These environment variables are not proof by themselves. Store approval emails/contracts and policy review evidence securely outside the public repository. Never commit publisher secrets or private keys.

## External approvals still required
1. Select an ad network and apply with the production domain; eligibility, Egypt availability, traffic thresholds, game-content policy, payment/tax onboarding, and account approval must be confirmed directly with that network.
2. Verify that each game publisher's license explicitly allows the proposed display ads, SDK, monetization, branding, and any required ad breaks. A generic embed permission is not enough.
3. If using a gaming SDK, obtain written SDK/commercial approval and implement only its official documented API, timing, reward callbacks, and validation.
4. Complete applicable privacy/consent and advertising disclosures for target countries, including provider-specific consent requirements and non-personalized ad behavior.
5. Configure a verified provider reporting/import mechanism before showing revenue.

## Safety / UX rules
- Fixed placement IDs only: `home_top`, `home_feed`, `game_below_player`, `game_sidebar`, `category_feed`.
- Never overlay the game stage, start/fullscreen controls, close controls, or navigation.
- Ads must be visually labeled. No fake close buttons, forced redirects, accidental-click designs, or auto-opening.
- No personalized ads unless a valid consent and provider CMP flow explicitly supports them.
- Provider failures must fail closed and must never block gameplay.
- Do not inject scripts into third-party game frames.
- No registration is required to launch a game.

## Monetization analytics
The schema reserves deduplicated provider event storage for requests, impressions, and clicks. These events must originate from provider callbacks or verified provider reports; client-side click events are not proof of billable clicks. Revenue ledger is reserved for verified reports. No ingestion endpoint or revenue importer is enabled yet; do not manually enter or present estimated revenue.

## Testing plan
1. Apply migration only in a backed-up staging D1 database.
2. Confirm all feature flags and five placements start disabled.
3. With environment approval/configuration flags absent, confirm no ad markup, SDK script, network request, or iframe overlay is emitted.
4. Toggle a placement on while provider readiness is false: public page must still emit no slot; display-ad feature toggle must be rejected.
5. With staging-only approval/configuration flags set, enable display feature and one placement; confirm only the fixed slot is rendered, visibly labeled, with bounded height and no overlap.
6. Simulate provider timeout/blocking/CSP failure: page and game launch remain usable.
7. Verify consent denied / unavailable: no personalized advertising; provider non-personalized mode is not implemented until adapter/CMP is approved.
8. Confirm no ad SDK is injected into iframe content and no rewarded-ad completion can be faked.
9. Confirm analytics counts are separated by request/impression/click and deduplicated; never infer revenue from these counts.
10. Confirm revenue remains “unavailable” without a verified provider report.
11. Verify admin authorization, same-origin mutation protection, audit records, and disabled defaults.
12. Check mobile layouts, keyboard focus, reduced motion, and no obstruction of game controls.

## Not included / known limitations
- No specific ad provider selected, applied for, or approved.
- No ad network SDK or gaming SDK integration.
- No consent-management platform integration for advertising.
- No server-side provider event webhook or signed report importer.
- No real ad requests, impressions, clicks, revenue, fill rate, or RPM are available.
- No sponsored-game purchase, billing, or paid-ranking workflow.
- No production ads are enabled by this PR.
- Migration is not applied and no deployment is performed.
