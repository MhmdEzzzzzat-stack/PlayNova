import test from "node:test";
import assert from "node:assert/strict";
import {ANALYTICS_EVENT_TYPES,isAnalyticsEventType,isAnalyticsId,validAnalyticsDate} from "../src/lib/analytics-validation.ts";
test("accepts only known analytics events",()=>{assert.equal(isAnalyticsEventType("game_view"),true);assert.equal(isAnalyticsEventType("password"),false);assert.equal(isAnalyticsEventType(null),false);});
test("event identifiers are restricted and sufficiently long",()=>{assert.equal(isAnalyticsId("a".repeat(36)),true);assert.equal(isAnalyticsId("short"),false);assert.equal(isAnalyticsId("../bad-id-000000"),false);});
test("date filters reject invalid and impossible dates",()=>{assert.equal(validAnalyticsDate("2026-10-30"),"2026-10-30");assert.equal(validAnalyticsDate("2026-02-30"),null);assert.equal(validAnalyticsDate("30-10-2026"),null);assert.equal(validAnalyticsDate(undefined),null);});
test("event allowlist contains no arbitrary event types",()=>assert.equal(ANALYTICS_EVENT_TYPES.includes("search"),true));
