import assert from "node:assert/strict";
import test from "node:test";
import { revalidatePaidAccess } from "./revalidateAccess.ts";
import {
  ACCESS_COOKIE_NAME,
  createAccessPayload,
  signAccessToken,
} from "./accessCookie.ts";
import type { CheckoutSessionSnapshot } from "./verifySession.ts";
const now = Date.parse("2026-10-15T00:00:00Z");
const env = {
  NODE_ENV: "production",
  PAYMENT_ACCESS_SECRET: "regression-test-access-secret",
};
async function cookie(id = "cs_live_paid123") {
  return `${ACCESS_COOKIE_NAME}=${await signAccessToken(createAccessPayload({ sessionId: id, email: null, paidAt: new Date(now).toISOString() }, now), env.PAYMENT_ACCESS_SECRET)}`;
}
const paid: CheckoutSessionSnapshot = {
  id: "cs_live_paid123",
  status: "complete",
  payment_status: "paid",
  amount_total: 4700,
  currency: "aud",
};
test("saved cookie alone never grants paid access", async () => {
  assert.equal(
    await revalidatePaidAccess(
      await cookie(),
      {
        retrieve: async () => {
          throw new Error("Unavailable");
        },
      },
      env,
      now,
    ),
    false,
  );
});
test("live verified payment allows returning access", async () => {
  assert.equal(
    await revalidatePaidAccess(
      await cookie(),
      { retrieve: async () => paid },
      env,
      now,
    ),
    true,
  );
  assert.equal(
    await revalidatePaidAccess(
      await cookie(),
      { retrieve: async () => ({ ...paid, amount_total: 9700 }) },
      env,
      now,
    ),
    true,
  );
});
test("unpaid, incomplete, wrong-price and unrelated checkouts reject a saved cookie", async () => {
  for (const change of [
    { payment_status: "unpaid" },
    { status: "open" },
    { amount_total: 9 },
    { currency: "usd" },
    { id: "cs_live_other123" },
  ]) {
    assert.equal(
      await revalidatePaidAccess(
        await cookie(),
        { retrieve: async () => ({ ...paid, ...change }) },
        env,
        now,
      ),
      false,
    );
  }
});
test("old test-mode cookies cannot unlock production", async () => {
  let retrieved = false;
  assert.equal(
    await revalidatePaidAccess(
      await cookie("cs_test_paid123"),
      {
        retrieve: async () => {
          retrieved = true;
          return paid;
        },
      },
      env,
      now,
    ),
    false,
  );
  assert.equal(retrieved, false);
});
test("missing and malformed cookies are rejected before Stripe is called", async () => {
  for (const value of [
    null,
    "mf_paid_access=garbage",
    "mf_paid_access=%E0%A4%A",
  ]) {
    assert.equal(
      await revalidatePaidAccess(
        value,
        {
          retrieve: async () => {
            throw new Error("Must not call");
          },
        },
        env,
        now,
      ),
      false,
    );
  }
});
