import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8");
const migration=read("../migrations/0006_monetization.sql");
const adminRoute=read("../src/app/api/admin/monetization/route.ts");
const placement=read("../src/components/ad-placement.tsx");
const player=read("../src/app/games/[slug]/player.tsx");
const privacy=read("../src/app/privacy/page.tsx");

test("monetization features and placements default to disabled",()=>{
 assert.match(migration,/enabled INTEGER NOT NULL DEFAULT 0/);
 assert.match(migration,/INSERT OR IGNORE INTO monetization_settings/);
 assert.match(migration,/INSERT OR IGNORE INTO ad_placements/);
});
test("only controlled placement identifiers are accepted",()=>{
 for(const id of ["home_top","home_feed","game_below_player","game_sidebar","category_feed"])assert.ok(migration.includes(id));
 assert.match(adminRoute,/ids=\["home_top","home_feed","game_below_player","game_sidebar","category_feed"\]/);
});
test("display ads require provider approval and configuration",()=>{
 assert.match(adminRoute,/ADS_PROVIDER_APPROVED==="true"/);
 assert.match(adminRoute,/ADS_PROVIDER_CONFIGURED==="true"/);
 assert.match(placement,/flags\.ADS_PROVIDER_APPROVED!=="true"\|\|flags\.ADS_PROVIDER_CONFIGURED!=="true"/);
});
test("ad placement fails closed if database or provider configuration is unavailable",()=>{
 assert.match(placement,/catch\{return null;\}/);
});
test("no advertising SDK is injected into third-party game iframe",()=>{
 assert.match(player,/<iframe/);
 assert.doesNotMatch(player,/adsbygoogle|googlesyndication|gamedistribution|crazygames/i);
});
test("advertising and sponsorship disclosures exist in Arabic and English",()=>{
 assert.match(privacy,/الإعلانات والرعايات/);
 assert.match(privacy,/Advertising and sponsorships/);
});
test("monetization events separate requests, impressions and clicks from revenue",()=>{
 assert.match(migration,/ad_request/);
 assert.match(migration,/impression/);
 assert.match(migration,/click/);
 assert.match(migration,/monetization_revenue_imports/);
 assert.match(adminRoute,/revenueAvailable/);
});
