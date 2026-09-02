# Money Finder V10 — launch QA checklist

Use this as a manual end-to-end pass before a real customer test. Do not treat a passing local build as a substitute for this list.

## 1. Landing page

- [ ] `/` loads a full product landing page (hero, how it works, what you get, who it is for, example map, expectations, FAQ, final CTA).
- [ ] Unpaid-demo / pre-launch copy appears when checkout is not live — no A$19 or pay-once claim.
- [ ] Primary CTA uses `getCustomerStartHref()` (assessment in demo mode, Payment Link when configured).
- [ ] “Ranked fits… not a promise of income” is visible.
- [ ] Privacy and Terms pages are linked from the footer.
- [ ] Mobile (~390px): sections stack without horizontal overflow.

## 2. Payment handoff

- [ ] Without `STRIPE_PAYMENT_LINK_URL`, demo mode stays open and `/success` is not a receipt.
- [ ] Intended live path: Landing → Payment Link → `/success?session_id=…` → server verifies Stripe → signed cookie → `/assessment` → `/results`.
- [ ] `/success` only says **Payment confirmed** after Stripe `status=complete` and `payment_status=paid`.
- [ ] Unpaid, malformed, or missing sessions do not receive a cookie and do not continue to the assessment.
- [ ] `/assessment` and `/results` are gated by the signed cookie when a Payment Link is configured.
- [ ] Cancel/return path remains `/`.
- [ ] Secret keys stay in env, not in source. Webhook verifies `Stripe-Signature` and does not grant browser access.

## 3. Assessment

- [ ] `/assessment` is the canonical questionnaire (not duplicated under the funnel group).
- [ ] Questions run one at a time with Back / Next.
- [ ] Submit still routes to `/results` without using `useAssessment()` on results.
- [ ] Retake assessment uses `/assessment?retake=1`, clears the saved assessment, and starts at Question 1.

## 4. Validation

- [ ] Required fields cannot be skipped.
- [ ] Invalid email is rejected.
- [ ] Optional questions (assets, avoidances, desired income) can be left blank.
- [ ] Exact strings are stored: `Under 5 hours`, `Writing and Content Creation`, `500 - 2000 dollars`, people-facing working style, `$500–$1,000`.

## 5. Review

- [ ] Completing the last question opens review.
- [ ] Review lists answers and allows jumping back to a question.

## 6. Submission

- [ ] Submit marks `step === "complete"` and writes `sessionStorage`.
- [ ] Browser lands on `/results` without pausing on the Assessment received screen.

## 7. Matching

- [ ] Matching lives in `lib/matching/`, not `lib/assessment/engine.ts`.
- [ ] Engine reads `AssessmentAnswers` only.
- [ ] Hard constraints: budget, time, risk → ineligible, score `0`.
- [ ] Canonical 25-opportunity catalog must be loaded before a real customer match.

## 8. Results

- [ ] `/results` reads `readStoredAssessment()` and requires `step === "complete"`.
- [ ] Top 3 render: name, rank, score, why it fits, milestones 1–3, actions 1–3.
- [ ] Incomplete assessment shows the empty state, not placeholder recommendations.
- [ ] Missing catalog shows the catalog-unavailable state — no fake production matches.

## 9. Money Map insight

- [ ] Rank 1 drives a personalised insight that includes the respondent’s first name.
- [ ] Insight is not a generic sentence copied onto every match.

## 10. Share / referral placeholder

- [ ] Share CTA is visible on a ready Money Map and is disabled.
- [ ] Landing may capture `?ref=` / `?share=` into sessionStorage.
- [ ] No tracking scripts, auth, referral database, or payment rewards.

## 11. Mobile layout

- [ ] Landing, assessment, results, success, and error views at ~375px width.
- [ ] Tap targets stay at least 44px (`min-h-11`).
- [ ] Result cards stack; score, milestones, and actions remain readable.

## 12. Error states

- [ ] Funnel `error.tsx` offers Try again and Back to home.
- [ ] Missing assessment on `/results` offers a path back to `/assessment`.
- [ ] `not-found` is reachable for unknown routes.

---

## Current blockers for a real customer test

1. **Stripe Dashboard (TEST mode).** Still required outside this repo — do not invent them:
   - Create a TEST Payment Link and set its success URL to `http://localhost:3010/success?session_id={CHECKOUT_SESSION_ID}`.
   - Put the Payment Link URL in `STRIPE_PAYMENT_LINK_URL`.
   - Put the TEST secret key (`sk_test_...`) in `STRIPE_SECRET_KEY`.
   - Create a webhook (Dashboard or `stripe listen --forward-to http://localhost:3010/api/stripe/webhook`) and put `whsec_...` in `STRIPE_WEBHOOK_SECRET`.
   - `PAYMENT_ACCESS_SECRET` is generated locally in `.env.local` and must stay gitignored.
2. **Durable delivery.** The Money Map still lives in `sessionStorage`. Payment access does not email or store results.
3. **Share / referral is a placeholder.** No share IDs, no attribution database, no live invite links.
4. **No production deploy** of this payment boundary yet.
5. **Pricing copy.** Do not restore A$19 / “Pay once” until a real Stripe TEST payment has been verified end-to-end.
