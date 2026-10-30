import test from "node:test";
import assert from "node:assert/strict";
import { absoluteUrl, jsonLd, localizedAlternates, localizedUrl, SITE_URL } from "../src/lib/seo.ts";

test("localized URLs preserve one path and set an explicit language", () => {
  const ar = new URL(localizedUrl("/games/example-game", "ar"));
  const en = new URL(localizedUrl("/games/example-game", "en"));
  assert.equal(ar.origin, SITE_URL);
  assert.equal(ar.pathname, "/games/example-game");
  assert.equal(ar.searchParams.get("lang"), "ar");
  assert.equal(en.searchParams.get("lang"), "en");
});

test("each language page has a self canonical and reciprocal hreflang URLs", () => {
  const ar = localizedAlternates("/games/example-game", "ar");
  const en = localizedAlternates("/games/example-game", "en");
  assert.equal(ar.canonical, localizedUrl("/games/example-game", "ar"));
  assert.equal(en.canonical, localizedUrl("/games/example-game", "en"));
  assert.equal(ar.languages.en, en.canonical);
  assert.equal(en.languages.ar, ar.canonical);
  assert.equal(ar.languages["x-default"], ar.canonical);
});

test("absolute URL helper resolves site-relative image and page paths", () => {
  assert.equal(absoluteUrl("/api/assets/abc"), SITE_URL + "/api/assets/abc");
});

test("JSON-LD escapes HTML opening characters to prevent script termination", () => {
  const serialized = jsonLd({ name: "</script><script>alert(1)</script>" });
  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("\\u003c/script>"), true);
});
