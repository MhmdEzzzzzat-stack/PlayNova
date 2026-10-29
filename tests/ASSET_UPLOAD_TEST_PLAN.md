# Asset upload failure and security verification

Automated tests run with `npm test` and cover malformed images, MIME mismatch, image size limit, malformed ZIP, missing root index.html, path traversal, unsupported ZIP MIME, exact HTTPS provider allowlist, and package upload role rules.

Before enabling uploads in production, perform these staging checks with a non-production R2 bucket:
1. Remove/rename the ASSETS_BUCKET binding temporarily and verify upload returns a controlled 503 with no D1 asset row.
2. Upload a valid image, interrupt the browser connection, retry, and verify the SHA-256 duplicate check prevents duplicate objects.
3. Upload a ZIP with encrypted entries, symlink metadata, duplicate names, excessive entry count, and high expansion ratio; all must be rejected.
4. Confirm editor/reviewer sessions receive 403 for HTML5 package uploads and administrator/owner uploads are staged only.
5. Confirm rejected and pending images are not served by /api/assets/{id}; approved raster images are served with nosniff and restrictive CSP.
6. Confirm no ZIP is executable or served from the application origin.

No antivirus engine is configured by this change. Package content remains untrusted. Isolated package extraction/hosting and CSP headers must be configured on a dedicated game origin before playable HTML5 packages can be published.
