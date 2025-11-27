# Environment Setup Implementation Plan
## Option 1: Separate Dev & Prod Supabase Projects

---

## 📋 Overview

This plan details how to separate your development and production environments using two distinct Supabase projects, with environment-specific configurations for Stripe payments and email delivery.

**Current State:**
- Single Supabase project (`ogpiovfxjxcclptfybrk`) for all environments
- Single Stripe key set (could be test or live)
- Single email configuration (sends to real addresses)

**Target State:**
- **Dev Project**: New Supabase project for development/testing
- **Prod Project**: Current project (`ogpiovfxjxcclptfybrk`) becomes production-only
- Environment-specific Stripe keys (test vs live)
- Email interception in dev (sandbox mode)

---

## 🎯 Phase 1: Create Development Supabase Project

### Step 1.1: Create New Dev Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Name it: `trainer-platform-dev` (or similar)
4. Choose same region as prod for consistency
5. Set strong database password (save securely)
6. Wait for project initialization (~2 minutes)

### Step 1.2: Copy Database Schema to Dev
```bash
# From your current prod project
# Export schema (Tables, RLS policies, functions, triggers)
```

**Options:**
- **A) Manual Schema Copy**: Use Supabase Dashboard SQL Editor to run migration scripts
- **B) CLI Migration**: Use Supabase CLI to push migrations to dev project

**Recommended**: Option A for first-time setup
1. Go to prod project SQL Editor
2. Generate schema export (can use pg_dump or manual exports)
3. Copy all migrations from `supabase/migrations/` folder
4. Run them sequentially in dev project SQL Editor

### Step 1.3: Copy Seed Data (Optional)
- Create test users in dev project
- Add sample trainer/client profiles
- Populate reference data (qualification lists, specialties, etc.)
- **Do NOT copy production user data** (GDPR/privacy concerns)

---

## 🔧 Phase 2: Configure Environment Detection

### Step 2.1: Add Environment Configuration File

Create `src/config/environment.ts`:
```typescript
export type Environment = 'development' | 'production';

export const getEnvironment = (): Environment => {
  // Option 1: Based on hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    return 'development';
  }
  
  // Option 2: Based on environment variable (set by build)
  if (import.meta.env.MODE === 'development') {
    return 'development';
  }
  
  return 'production';
};

export const isDevelopment = () => getEnvironment() === 'development';
export const isProduction = () => getEnvironment() === 'production';

// Supabase Configuration
export const getSupabaseConfig = () => {
  const env = getEnvironment();
  
  if (env === 'development') {
    return {
      url: 'https://[DEV_PROJECT_ID].supabase.co',
      anonKey: '[DEV_ANON_KEY]'
    };
  }
  
  return {
    url: 'https://ogpiovfxjxcclptfybrk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw'
  };
};
```

### Step 2.2: Update Supabase Client

Update `src/integrations/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig } from '@/config/environment';

const config = getSupabaseConfig();

export const supabase = createClient<Database>(config.url, config.anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## 💳 Phase 3: Configure Stripe for Dual Environments

### Step 3.1: Set Up Stripe Secrets in Both Projects

**Development Project Secrets:**
```
STRIPE_SECRET_KEY=sk_test_... (Stripe Test Key)
STRIPE_WEBHOOK_SECRET=whsec_... (Stripe Test Webhook Secret)
```

**Production Project Secrets:**
```
STRIPE_SECRET_KEY=sk_live_... (Stripe Live Key)
STRIPE_WEBHOOK_SECRET=whsec_... (Stripe Live Webhook Secret)
```

### Step 3.2: Configure Stripe Webhooks

**Development Webhook:**
1. Go to Stripe Dashboard (Test mode)
2. Add webhook endpoint: `https://[DEV_PROJECT_ID].supabase.co/functions/v1/webhook-handler`
3. Select events: `checkout.session.completed`, `invoice.payment_failed`, etc.
4. Copy webhook secret to dev project

**Production Webhook:**
1. Switch to Stripe Live mode
2. Add webhook endpoint: `https://ogpiovfxjxcclptfybrk.supabase.co/functions/v1/webhook-handler`
3. Select same events
4. Copy webhook secret to prod project

### Step 3.3: Update Edge Functions (No Code Changes Needed)
Edge functions automatically use the secrets configured in their respective Supabase projects. No code changes required - the same code works in both environments.

---

## 📧 Phase 4: Configure Email Handling

### Step 4.1: Set Up Resend API Keys

**Development Project:**
```
RESEND_API_KEY=re_... (Can be same key or separate test key)
FROM_EMAIL=dev@yourdomain.com
EMAIL_INTERCEPT_ENABLED=true
EMAIL_INTERCEPT_ADDRESS=dev-team@yourdomain.com
```

**Production Project:**
```
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
EMAIL_INTERCEPT_ENABLED=false
```

### Step 4.2: Create Email Utility with Interception

Create `supabase/functions/_shared/email-utils.ts`:
```typescript
interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (
  resendClient: any,
  options: EmailOptions
) => {
  const interceptEnabled = Deno.env.get('EMAIL_INTERCEPT_ENABLED') === 'true';
  const interceptAddress = Deno.env.get('EMAIL_INTERCEPT_ADDRESS');
  
  if (interceptEnabled && interceptAddress) {
    // Development mode - intercept emails
    console.log('🚧 DEV MODE: Email intercepted');
    console.log('Original recipient:', options.to);
    console.log('Redirected to:', interceptAddress);
    
    const originalRecipients = Array.isArray(options.to) 
      ? options.to.join(', ') 
      : options.to;
    
    return await resendClient.emails.send({
      from: Deno.env.get('FROM_EMAIL')!,
      to: interceptAddress,
      subject: `[DEV] ${options.subject}`,
      html: `
        <div style="background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
          <strong>🚧 Development Mode Email</strong><br/>
          <strong>Original Recipient:</strong> ${originalRecipients}<br/>
          <strong>Subject:</strong> ${options.subject}
        </div>
        ${options.html}
      `
    });
  }
  
  // Production mode - send normally
  return await resendClient.emails.send({
    from: Deno.env.get('FROM_EMAIL')!,
    to: options.to,
    subject: options.subject,
    html: options.html
  });
};
```

### Step 4.3: Update All Email-Sending Edge Functions

Update these functions to use the new `sendEmail` utility:
- `send-auth-emails`
- `send-welcome-email`
- `send-delayed-welcome-emails`
- `send-discovery-call-email`
- `send-scheduled-reminders`

**Example Update**:
```typescript
// Before
await resend.emails.send({
  from: Deno.env.get('FROM_EMAIL')!,
  to: userEmail,
  subject: 'Welcome',
  html: emailHtml
});

// After
import { sendEmail } from '../_shared/email-utils.ts';

await sendEmail(resend, {
  to: userEmail,
  subject: 'Welcome',
  html: emailHtml
});
```

---

## 🔄 Phase 5: Migration Strategy

### Step 5.1: Pre-Migration Checklist
- [ ] Dev Supabase project created
- [ ] Database schema copied to dev
- [ ] Test users created in dev
- [ ] Stripe test mode configured in dev
- [ ] Stripe live mode configured in prod
- [ ] Email interception configured in dev
- [ ] Environment detection code deployed

### Step 5.2: Migration Day Plan

**1. Create Feature Branch**
```bash
git checkout -b feature/dual-environment-setup
```

**2. Update Codebase**
- Add `src/config/environment.ts`
- Update `src/integrations/supabase/client.ts`
- Add `supabase/functions/_shared/email-utils.ts`
- Update all email-sending edge functions

**3. Deploy to Dev Project First**
- Test authentication flow
- Test Stripe checkout (test mode)
- Test email sending (verify interception)
- Test all major features

**4. Deploy to Prod Project**
- Merge feature branch
- Deploy updated code
- Monitor for issues
- Verify emails going to real users
- Verify Stripe live payments work

### Step 5.3: Rollback Plan
If issues occur:
1. Revert Supabase client to hardcoded prod credentials
2. Deploy rollback
3. Debug issues in dev environment
4. Retry deployment

---

## 🧪 Phase 6: Testing & Verification

### Development Environment Tests
- [ ] Authentication works with dev Supabase project
- [ ] Database queries return dev data
- [ ] Stripe test payments complete successfully
- [ ] Emails intercepted and redirected to dev team
- [ ] Edge functions execute with dev secrets
- [ ] All major user flows work

### Production Environment Tests
- [ ] Authentication works with prod Supabase project
- [ ] Database queries return prod data
- [ ] Stripe live payments work (small test transaction)
- [ ] Emails sent to real users
- [ ] Edge functions execute with prod secrets
- [ ] No dev data leaking into prod

---

## 🎛️ Phase 7: Developer Workflow

### Working in Development
1. Code changes made locally
2. Lovable deploys to preview URL (uses dev Supabase)
3. Test with test Stripe cards
4. Emails intercepted to dev team
5. Safe to test without affecting real users

### Deploying to Production
1. Merge to main branch
2. Lovable production deployment (uses prod Supabase)
3. Real Stripe payments
4. Real emails to users
5. Production monitoring active

### Environment Indicators
Add visual indicator in UI for development mode:

```typescript
// src/components/DevModeBanner.tsx
import { isDevelopment } from '@/config/environment';

export const DevModeBanner = () => {
  if (!isDevelopment()) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg z-50">
      <strong>🚧 Development Mode</strong>
      <div className="text-sm">Using test data & Stripe test mode</div>
    </div>
  );
};
```

---

## 📊 Phase 8: Monitoring & Maintenance

### Development Monitoring
- Check edge function logs regularly
- Verify email interception working
- Monitor Stripe test payments

### Production Monitoring
- Set up alerts for failed payments
- Monitor email delivery rates
- Track edge function errors
- Set up Stripe webhook monitoring

### Maintenance Tasks
- Keep dev data fresh with periodic resets
- Sync schema changes from prod to dev
- Review intercepted emails weekly
- Update Stripe test data as needed

---

## ⚠️ Important Considerations

### Security
- Never commit API keys to git
- Keep dev and prod secrets separate
- Use strong passwords for both databases
- Regularly rotate API keys

### Data Privacy
- Never copy real user data to dev
- Use fake/anonymized data in dev
- GDPR compliance: no production PII in dev environment

### Costs
- Dev project will have separate billing
- Monitor usage to control costs
- Consider pausing dev project when not in use
- Use smaller database size for dev

### Team Coordination
- Document which environment team members should use
- Establish clear deployment procedures
- Set up proper access controls for prod
- Create runbooks for common issues

---

## 📝 Summary

This implementation plan provides a complete dual-environment setup that:
✅ Separates dev and prod data completely
✅ Prevents test emails reaching real users  
✅ Uses Stripe test mode in dev, live mode in prod
✅ Maintains same codebase for both environments
✅ Provides clear environment detection
✅ Enables safe testing without production impact

**Estimated Implementation Time**: 4-6 hours
**Risk Level**: Medium (requires careful testing)
**Rollback Difficulty**: Easy (revert to single environment)

---

## 🚀 Next Steps

1. Review this plan with your team
2. Create dev Supabase project
3. Implement environment detection code
4. Test in development thoroughly
5. Deploy to production during low-traffic period
6. Monitor closely for 24-48 hours

**Questions or need help with implementation?** Let me know which phase you'd like to start with!
