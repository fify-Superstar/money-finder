import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInviteUrl,
  buildShareableResultUrl,
  parseReferralFromSearch,
} from "./referral.ts";

test("shareable result URLs use /results?share= and stay null without an id", () => {
  assert.equal(buildShareableResultUrl("https://example.test", null), null);
  assert.equal(
    buildShareableResultUrl("https://example.test", "map_abc"),
    "https://example.test/results?share=map_abc",
  );
});

test("invite URLs send recipients to the landing page with an optional ref code", () => {
  assert.equal(buildInviteUrl("https://example.test", null), "https://example.test/");
  assert.equal(
    buildInviteUrl("https://example.test", "ada-1"),
    "https://example.test/?ref=ada-1",
  );
});

test("referral attribution reads ref and share query params without a database", () => {
  const empty = parseReferralFromSearch("");
  assert.equal(empty.referralCode, null);
  assert.equal(empty.sourceShareId, null);

  const captured = parseReferralFromSearch("?ref=ada-1&share=map_abc");
  assert.equal(captured.referralCode, "ada-1");
  assert.equal(captured.sourceShareId, "map_abc");
  assert.equal(typeof captured.capturedAt, "string");
});
