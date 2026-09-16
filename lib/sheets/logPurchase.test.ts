import assert from "node:assert/strict";
import test from "node:test";
import { logPurchaseToGoogleSheet, type PurchaseLogRecord } from "./logPurchase.ts";

const record: PurchaseLogRecord = {
  loggedAt: "2026-09-16T02:00:00.000Z",
  eventId: "evt_test_1",
  sessionId: "cs_test_paidSession123",
  email: "paid@example.test",
  amountTotal: 4900,
  currency: "aud",
  productTier: "premium",
  productLabel: "A$49 Premium",
  paymentStatus: "paid",
};

test("Google Sheets log skips when GOOGLE_SHEETS_LOG_URL is empty", async () => {
  let called = false;
  const result = await logPurchaseToGoogleSheet(record, {}, async () => {
    called = true;
    return { ok: true };
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.skipped, true);
  }
  assert.equal(called, false);
});

test("Google Sheets log rejects a non-https destination", async () => {
  const result = await logPurchaseToGoogleSheet(
    record,
    { GOOGLE_SHEETS_LOG_URL: "http://example.test/log" },
    async () => ({ ok: true }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_log_url");
  }
});

test("Google Sheets log posts the purchase row to the configured https URL", async () => {
  let url = "";
  let body = "";
  let authorization = "";
  const result = await logPurchaseToGoogleSheet(
    record,
    {
      GOOGLE_SHEETS_LOG_URL: "https://example.test/sheets-log",
      GOOGLE_SHEETS_LOG_TOKEN: "sheet-token",
    },
    async (input, init) => {
      url = input;
      body = init.body;
      authorization = init.headers.authorization ?? "";
      return { ok: true };
    },
  );

  assert.equal(result.ok, true);
  assert.equal(url, "https://example.test/sheets-log");
  assert.equal(authorization, "Bearer sheet-token");
  assert.match(body, /A\$49 Premium/);
  assert.match(body, /cs_test_paidSession123/);
});

test("Google Sheets log surfaces a rejected destination", async () => {
  const result = await logPurchaseToGoogleSheet(
    record,
    { GOOGLE_SHEETS_LOG_URL: "https://example.test/sheets-log" },
    async () => ({ ok: false }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "sheets_rejected");
  }
});
