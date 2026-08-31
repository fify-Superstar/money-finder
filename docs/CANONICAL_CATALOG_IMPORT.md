# Canonical V9 catalog import — required shape

This document is the import contract for loading the validated 25-opportunity Money Finder V9 catalog into V10.

**Do not invent, infer, recreate, or approximate missing V9 values.**  
The production array `OPPORTUNITIES` in `lib/matching/catalog.ts` must stay empty until every field below is supplied from the canonical source.

Target type: `Opportunity` in `lib/matching/types.ts`.  
Expected count: `CANONICAL_OPPORTUNITY_COUNT` = **25**.

---

## Every field required for one opportunity

| Field | TypeScript type | Expected value format | Hard constraint | Weighted score (100%) | Money Map display |
| --- | --- | --- | --- | --- | --- |
| `id` | `string` | Non-empty stable identifier for the V9 row (also used for tie-breaks and result keys). | No | No (tie-break only) | Indirect (list key); not shown as a label |
| `name` | `string` | Non-empty opportunity title, exact V9 wording. | No | No (tie-break only) | Yes — opportunity name |
| `minTimeHours` | `number` | Finite hours. Compared with mapped respondent time (`Under 5 hours` → `4`). | **Yes — time** | Time fit **20%** (100 if hard pass, else ineligible / 0) | No (feeds eligibility / Time fit copy) |
| `minBudgetDollars` | `number` | Finite dollars. Compared with mapped budget (`500 - 2000 dollars` → `2000`, so requirements `<= 500` stay eligible). | **Yes — budget** | Budget fit **20%** (100 if hard pass, else ineligible / 0) | No (feeds eligibility / budget copy) |
| `riskRequirement` | `number` | Finite number on the same 1–5 scale as assessment Q10. Respondent `riskTolerance` must be `>=` this value. | **Yes — risk** | Risk fit **10%** (100 if hard pass, else ineligible / 0) | No |
| `skills` | `string[]` | Exact assessment skill strings to match, e.g. `Writing and Content Creation`. Strong fit if `skills` includes the respondent skill. | No | Skill fit **20%** (100 or 0) | No (feeds `Strong skill fit.`) |
| `workingStyles` | `string[]` | Exact assessment working-style strings, e.g. `I prefer interacting with people (in person or online)`. | No | Work style **15%** (100 or 0) | No (feeds `Work-style fit.` only when matched) |
| `techRequirement` | `number` | Finite number on the same 1–5 scale as assessment Q8. Respondent `techComfort` must be `>=` this value for technology fit copy. | No | **Not weighted** | No (feeds `Technology fit.`) |
| `goals` | `string[]` | Exact assessment goal strings, e.g. `Replace my full-time salary`. | No | Goal fit **15%** (100 or 0) | No |
| `incomePotentialMin` | `number` | Finite dollars. Overlaps respondent desired-income band for compatibility copy. | No | **Not weighted** | No (feeds income sentence in explanation) |
| `incomePotentialMax` | `number` | Finite dollars; should be `>= incomePotentialMin`. | No | **Not weighted** | No (feeds income sentence in explanation) |
| `milestones` | `[string, string, string]` | Exactly three non-empty strings, V9 milestone 1–3 order. | No | No | Yes — Milestone 1, 2, 3 |
| `actions` | `[string, string, string]` | Exactly three non-empty strings, V9 action 1–3 order. | No | No | Yes — Action 1, 2, 3 |

Derived Money Map fields (not catalog columns): `rank`, `score`, `explanation` / “why it fits”, and the Rank 1 insight. Those are produced by `lib/matching/match.ts` after import.

### Hard constraints (fail → `Ineligible`, score `0`)

Respondent mapped values must satisfy **all** of:

- `budgetDollars >= minBudgetDollars`
- `timeHours >= minTimeHours`
- `riskTolerance >= riskRequirement`

Ineligible explanation (fixed): `Not eligible: one or more hard constraints are not met.`

### Weighted scoring (eligible only)

Budget 20% + Time 20% + Skill 20% + Work style 15% + Risk 10% + Goal 15% = 100%.

`techRequirement` and income potential are **not** in the 100% total; they only affect explanation text.

### Skill / working-style / goal string alignment

Catalog arrays should use the **exact** assessment option strings stored on `AssessmentAnswers` (matching uses `.includes`, not fuzzy text).

---

## Example structure — Small Business Email Copy only

Known from the R007 / Opportunity DB row 24 trace. Every other field is unknown and must not be guessed.

```ts
{
  id: "TODO — CANONICAL V9 VALUE REQUIRED",
  name: "Small Business Email Copy",
  minTimeHours: "TODO — CANONICAL V9 VALUE REQUIRED", // number, hours
  minBudgetDollars: "TODO — CANONICAL V9 VALUE REQUIRED", // number, dollars
  riskRequirement: "TODO — CANONICAL V9 VALUE REQUIRED", // number, 1–5
  skills: ["TODO — CANONICAL V9 VALUE REQUIRED"],
  workingStyles: ["TODO — CANONICAL V9 VALUE REQUIRED"],
  techRequirement: "TODO — CANONICAL V9 VALUE REQUIRED", // number, 1–5
  goals: ["TODO — CANONICAL V9 VALUE REQUIRED"],
  incomePotentialMin: "TODO — CANONICAL V9 VALUE REQUIRED", // number, dollars
  incomePotentialMax: "TODO — CANONICAL V9 VALUE REQUIRED", // number, dollars
  milestones: [
    "Write 3 sample emails",
    "Offer a starter package",
    "Land first client",
  ],
  actions: [
    "Learn basic email copy",
    "Build a sample pack",
    "Contact local businesses",
  ],
}
```

Also known as **names only** (not complete rows): `Resume & LinkedIn Profile Writing`, `Content Repurposing Writer`. All 22 other names are unknown.

---

## Import rule

When the 25 complete canonical rows are supplied, load them into `OPPORTUNITIES` in `lib/matching/catalog.ts`. Until then:

- Keep `OPPORTUNITIES` as `[]`.
- Do not pad the array to length 25.
- Run `validateCanonicalCatalog()` from `lib/catalog-import/validate.ts` on the supplied payload before merging.
