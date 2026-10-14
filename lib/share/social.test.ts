import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_SHARE_URL, publicShareUrl, socialShareLinks } from "./social.ts";

test("sharing strips private results, checkout sessions and foreign destinations", () => {
  for (const url of ["https://www.moneyfinderapp.com/results?session_id=cs_live_private", "https://evil.example/?ref=abc", "javascript:alert(1)", "invalid"]) {
    assert.equal(publicShareUrl(url), PUBLIC_SHARE_URL);
  }
  assert.equal(publicShareUrl(`${PUBLIC_SHARE_URL}?session_id=private&email=private@example.test&ref=friend-1`), `${PUBLIC_SHARE_URL}?ref=friend-1`);
});

test("each platform gets an encoded public homepage without private parameters", () => {
  const links = socialShareLinks("https://www.moneyfinderapp.com/results?email=private@example.test");
  assert.equal(links.length, 4);
  for (const link of links) {
    assert.equal(new URL(link.href).protocol, "https:");
    assert.ok(decodeURIComponent(link.href).includes(PUBLIC_SHARE_URL));
    assert.ok(!decodeURIComponent(link.href).includes("private@example.test"));
  }
});
