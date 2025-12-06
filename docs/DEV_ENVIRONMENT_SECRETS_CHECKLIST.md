# Development Environment Secrets Checklist

This document lists all secrets required to set up a development Supabase project, categorized by requirement level.

## Setup Instructions

1. Go to your **Dev Supabase Dashboard** → Project Settings → Edge Functions → Secrets
2. Add each secret listed below with the appropriate dev value

---

## ✅ Required Secrets (No Fallbacks - Functions Will Fail Without These)

### Email (Resend)

| Secret Name | Used By | Dev Value | Notes |
|-------------|---------|-----------|-------|
| `RESEND_API_KEY` | All email functions | `re_...` | Get from Resend Dashboard. Can use same key as prod or create dev-specific key |
| `RESEND_FROM` | `send-auth-emails`, `send-discovery-call-email` | `PTpal Dev <dev@ptpal.io>` | Full "From" header with display name. Must be a verified domain in Resend |

### Auth Hook

| Secret Name | Used By | Dev Value | Notes |
|-------------|---------|-----------|-------|
| `SEND_EMAIL_HOOK_SECRET` | `send-auth-emails` | Auto-generated | Generated when configuring Auth Email Hook in Supabase Dashboard → Auth → Hooks |

---

## 🔄 Optional Secrets (Have Fallbacks - Functions Work With Defaults)

These secrets have built-in fallback values. Only configure if you need to override the defaults.

### Application URLs

| Secret Name | Fallback Value | Used By | When to Override |
|-------------|----------------|---------|------------------|
| `APP_BASE_URL` | Derives from `SUPABASE_URL` (e.g., `https://[project-ref].supabase.co`) | `send-auth-emails`, `send-discovery-call-email` | Set to `https://dev.ptpal.io` once custom domain is connected |
| `SUPPORT_EMAIL` | `support@notanother.coach` | `send-auth-emails` | Override if you want dev-specific support email |

### Email Addresses

| Secret Name | Fallback Value | Used By | When to Override |
|-------------|----------------|---------|------------------|
| `FROM_EMAIL` | `Not Another Coach <onboarding@resend.dev>` | `send-delayed-welcome-emails`, `send-welcome-email` | Override to use your verified domain. Note: `onboarding@resend.dev` is Resend's sandbox |
| `TEST_FROM_EMAIL` | Not set (uses `FROM_EMAIL`) | Email testing | Only needed for isolated test email sending |

---

## ⚠️ Stripe Secrets (NOT FULLY FUNCTIONING - To Revisit)

Stripe integration is incomplete. These secrets are configured but the checkout flow is not fully working.

### Currently Configured ✅

| Secret Name | Status | Notes |
|-------------|--------|-------|
| `STRIPE_SECRET_KEY` | ✅ Configured | Using live key - switch to `sk_test_...` for dev |
| `STRIPE_PUBLISHABLE_KEY` | ✅ Configured | Using live key - switch to `pk_test_...` for dev |
| `STRIPE_WEBHOOK_SECRET` | ✅ Configured | Need new webhook for dev Supabase URL |

### Missing ❌ (Required for checkout to work)

| Secret Name | Status | Notes |
|-------------|--------|-------|
| `STRIPE_HIGH_PLAN_PRICE_ID` | ❌ NOT CONFIGURED | Create test products/prices in Stripe Test Mode |
| `STRIPE_LOW_PLAN_PRICE_ID` | ❌ NOT CONFIGURED | Create test products/prices in Stripe Test Mode |

### TODO: Stripe Setup
- [ ] Switch to Test Mode in Stripe Dashboard
- [ ] Copy Test API keys (`sk_test_...`, `pk_test_...`)
- [ ] Create test products matching production (High Plan, Low Plan)
- [ ] Copy test Price IDs and add as secrets
- [ ] Create webhook endpoint pointing to dev Supabase edge function URL
- [ ] Copy webhook signing secret

---

## 📸 Instagram Secrets (Optional)

Only needed if testing Instagram integration features.

| Secret Name | Status | Notes |
|-------------|--------|-------|
| `INSTAGRAM_APP_ID` | Optional | Create test app in Meta Developer Console |
| `INSTAGRAM_APP_SECRET` | Optional | Only needed if testing Instagram integration |

---

## 🔧 Auto-Provided by Supabase (No Action Needed)

These are automatically available in edge functions:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Quick Setup Checklist

### Minimum Required (Email Functions Will Work)
- [ ] Add `RESEND_API_KEY`
- [ ] Add `RESEND_FROM` (verified domain)
- [ ] Configure Auth Email Hook → note the generated `SEND_EMAIL_HOOK_SECRET`

### Recommended for Dev Environment
- [ ] Add `APP_BASE_URL` = `https://dev.ptpal.io` (once domain connected)
- [ ] Add `FROM_EMAIL` (override Resend sandbox default)

### Stripe (When Ready to Implement)
- [ ] Add `STRIPE_SECRET_KEY` (test key)
- [ ] Add `STRIPE_PUBLISHABLE_KEY` (test key)
- [ ] Add `STRIPE_WEBHOOK_SECRET` (dev webhook secret)
- [ ] Add `STRIPE_HIGH_PLAN_PRICE_ID` (test price id)
- [ ] Add `STRIPE_LOW_PLAN_PRICE_ID` (test price id)

### Optional
- [ ] Add `INSTAGRAM_APP_ID` (if testing Instagram)
- [ ] Add `INSTAGRAM_APP_SECRET` (if testing Instagram)

---

## Verification

After setup, verify by:
1. Triggering a password reset email → Check email links point to correct URL
2. Checking edge function logs for any missing secret errors
3. (When Stripe ready) Testing Stripe checkout → Verify test mode payments work
