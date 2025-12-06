# Development Environment Secrets Checklist

This document lists all secrets required to set up a development Supabase project.

## Setup Instructions

1. Go to your **Dev Supabase Dashboard** → Project Settings → Edge Functions → Secrets
2. Add each secret listed below with the appropriate dev value

---

## Required Secrets

### Stripe (Test Mode)

| Secret Name | Production Value | Dev Value | Notes |
|-------------|------------------|-----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_test_...` | Get from Stripe Dashboard → Test Mode → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_test_...` | Get from Stripe Dashboard → Test Mode → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (prod) | `whsec_...` (dev) | Create new webhook in Stripe Test Mode pointing to dev Supabase URL |
| `STRIPE_HIGH_PLAN_PRICE_ID` | `price_...` (prod) | `price_...` (dev) | Create test products/prices in Stripe Test Mode |
| `STRIPE_LOW_PLAN_PRICE_ID` | `price_...` (prod) | `price_...` (dev) | Create test products/prices in Stripe Test Mode |

### Email (Resend)

| Secret Name | Production Value | Dev Value | Notes |
|-------------|------------------|-----------|-------|
| `RESEND_API_KEY` | `re_...` (prod) | `re_...` (same or dev key) | Can use same key or create dev-specific key |
| `FROM_EMAIL` | `hello@ptpal.io` | `dev@ptpal.io` or same | Email address for sending |
| `RESEND_FROM` | `PTpal <hello@ptpal.io>` | `PTpal Dev <dev@ptpal.io>` | Full "From" header |
| `TEST_FROM_EMAIL` | (not set) | `dev-test@ptpal.io` | Optional: for test emails |

### Application URLs

| Secret Name | Production Value | Dev Value | Notes |
|-------------|------------------|-----------|-------|
| `APP_BASE_URL` | `https://ptpal.io` | `https://[dev-project-ref].supabase.co` or local URL | Base URL for email links |
| `SUPPORT_EMAIL` | `support@ptpal.io` | `dev-support@ptpal.io` or same | Support contact email |

### Instagram (Optional for Dev)

| Secret Name | Production Value | Dev Value | Notes |
|-------------|------------------|-----------|-------|
| `INSTAGRAM_APP_ID` | (prod app id) | (test app id) | Optional: Create test app in Meta Developer Console |
| `INSTAGRAM_APP_SECRET` | (prod secret) | (test secret) | Optional: Only needed if testing Instagram integration |

### Auth Hook (Auto-generated)

| Secret Name | Production Value | Dev Value | Notes |
|-------------|------------------|-----------|-------|
| `SEND_EMAIL_HOOK_SECRET` | (auto) | (auto) | Generated when configuring Auth Email Hook in Supabase Dashboard |

---

## Auto-Provided by Supabase (No Action Needed)

These are automatically available in edge functions:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Setup Checklist

### Stripe Test Mode Setup
- [ ] Switch to Test Mode in Stripe Dashboard
- [ ] Copy Test API keys (`sk_test_...`, `pk_test_...`)
- [ ] Create test products matching production (High Plan, Low Plan)
- [ ] Copy test Price IDs
- [ ] Create webhook endpoint pointing to dev Supabase edge function URL
- [ ] Copy webhook signing secret

### Supabase Dev Project Secrets
- [ ] Add `STRIPE_SECRET_KEY` (test key)
- [ ] Add `STRIPE_PUBLISHABLE_KEY` (test key)
- [ ] Add `STRIPE_WEBHOOK_SECRET` (dev webhook secret)
- [ ] Add `STRIPE_HIGH_PLAN_PRICE_ID` (test price id)
- [ ] Add `STRIPE_LOW_PLAN_PRICE_ID` (test price id)
- [ ] Add `RESEND_API_KEY`
- [ ] Add `FROM_EMAIL`
- [ ] Add `RESEND_FROM`
- [ ] Add `APP_BASE_URL` (dev URL)
- [ ] Add `SUPPORT_EMAIL`
- [ ] Configure Auth Email Hook and note the generated `SEND_EMAIL_HOOK_SECRET`

### Optional
- [ ] Add `INSTAGRAM_APP_ID` (if testing Instagram)
- [ ] Add `INSTAGRAM_APP_SECRET` (if testing Instagram)
- [ ] Add `TEST_FROM_EMAIL` (if using separate test email)

---

## Verification

After setup, verify by:
1. Triggering a password reset email → Check email links point to dev URL
2. Testing Stripe checkout → Verify test mode payments work
3. Checking edge function logs for any missing secret errors
