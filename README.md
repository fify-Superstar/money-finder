# Money Finder V10

Customer-facing web app for the Money Finder assessment and personalised Top 3 Money Map.

**Status:** Unpaid private demo until `STRIPE_PAYMENT_LINK_URL` is set. Payment is verified server-side; the browser is never treated as proof of payment.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS.

## Checks

```bash
npm test
npm run build
```

## Local development

```bash
npm run dev
```

Copy `.env.example` to `.env.local` and fill values locally. Do not commit secrets.

This project’s `APP_URL` is `http://localhost:3010`. Start the app on that port:

```bash
npx next dev -p 3010
```

Until `STRIPE_PAYMENT_LINK_URL` is set, the app stays an unpaid private demo. A$19 / “Pay once” copy stays off until a real Stripe TEST payment is verified end-to-end.

### Stripe TEST payment (when you are ready)

Required in `.env.local` (never commit these):

- `STRIPE_PAYMENT_LINK_URL` — TEST Payment Link from Stripe Dashboard
- `STRIPE_SECRET_KEY` — `sk_test_...` only
- `STRIPE_WEBHOOK_SECRET` — `whsec_...` from CLI or Dashboard
- `PAYMENT_ACCESS_SECRET` — local HMAC secret for the access cookie
- `APP_URL=http://localhost:3010`

Payment Link success URL in Stripe Dashboard:

```text
http://localhost:3010/success?session_id={CHECKOUT_SESSION_ID}
```

If Stripe CLI is installed, forward webhooks with:

```bash
stripe listen --forward-to http://localhost:3010/api/stripe/webhook
```

Copy the printed `whsec_...` into `.env.local` and restart the app. Do not paste secrets into chat.

Access is granted only after the server retrieves the Checkout Session and Stripe reports `status=complete` and `payment_status=paid`. Query parameters, `sessionStorage`, and React state are not proof of payment.

## Notes

- Do not add Stripe secret keys, API keys, or other secrets to source files.
- Do not use real customer data.
- Matching logic follows the validated Money Finder V9 specification.
