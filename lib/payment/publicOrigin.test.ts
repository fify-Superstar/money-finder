import assert from "node:assert/strict";
import test from "node:test";
import { publicOriginFromRequest } from "./publicOrigin.ts";

test("post-payment redirects follow the browser host, not APP_URL", () => {
  assert.equal(
    publicOriginFromRequest(
      "https://money-finder-cb1r.vercel.app/api/stripe/complete",
      {
        forwardedHost: "www.moneyfinderapp.com",
        forwardedProto: "https",
      },
      "http://localhost:3010",
    ),
    "https://www.moneyfinderapp.com",
  );
});

test("falls back to the request origin when no forwarded host is present", () => {
  assert.equal(
    publicOriginFromRequest(
      "https://money-finder-cb1r.vercel.app/api/stripe/complete",
      {},
      "http://localhost:3010",
    ),
    "https://money-finder-cb1r.vercel.app",
  );
});
