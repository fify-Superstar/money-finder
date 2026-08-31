# Money Finder V10 — launch QA checklist

Use this as a manual end-to-end pass before a real customer test. Do not treat a passing local build as a substitute for this list.

## 1. Landing page

- [ ] `/` loads with the Money Finder headline, A$19 one-time price, and no subscription claim.
- [ ] Primary CTA uses `getCustomerStartHref()` (assessment today; Stripe Payment Link later).
- [ ] Income-disclaimer copy is visible.
- [ ] Mobile: hero, steps, and price card stack without overflow.

## 2. Payment handoff

- [ ] Stripe Payment Link is **not** connected (`paymentLinkUrl` is `null`).
- [ ] Intended live path: Landing → Payment Link → `/success` → `/assessment` → `/results`.
- [ ] `/success` points people to the assessment, not a fake paid Money Map.
- [ ] Cancel/return path remains `/`.
- [ ] No secret keys, webhooks, or Stripe SDK calls are in the app.

## 3. Assessment

- [ ] `/assessment` is the canonical questionnaire (not duplicated under the funnel group).
- [ ] Questions run one at a time with Back / Next.
- [ ] Submit still routes to `/results` without using `useAssessment()` on results.

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
- [ ] Browser lands on `/results`.

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

1. **Canonical opportunity catalog missing.** The 25 validated V9 rows are not in the workspace. Matching cannot produce a real Top 3 (including R007) until those rows are supplied. Do not fabricate them.
2. **Stripe Payment Link not connected.** Anyone can open `/assessment` without paying. Do not run a paid customer test until checkout is wired.
3. **Payment access is not enforced.** `PaymentAccessRecord` exists as an interface only; assessment is not gated.
4. **Share / referral is a placeholder.** No share IDs, no attribution database, no live invite links.
5. **R007 regression cannot run** against the empty catalog.
6. **No production deploy** in this batch (by design).
