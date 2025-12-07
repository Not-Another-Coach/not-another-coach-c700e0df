# GitHub Branching Strategy for Dual Environment Setup

This document outlines the GitHub branching strategy for managing separate development and production environments using two Lovable projects.

## Overview

We use a **two-project, two-branch** architecture:

| Lovable Project | Git Branch | Domain | Supabase Backend |
|-----------------|------------|--------|------------------|
| Dev Project | `develop` | `dev.notanother.coach` | `zkzahqnsfjnvskfywbvg` |
| Prod Project | `main` | `notanother.coach` | `ogpiovfxjxcclptfybrk` |

## Branch Structure

```
main (production)
 │
 └── develop (development)
      │
      └── feature/* (optional feature branches)
```

### Branch Purposes

- **`main`**: Production-ready code. Syncs with the Production Lovable project.
- **`develop`**: Active development. Syncs with the Development Lovable project.
- **`feature/*`**: Optional feature branches for larger changes (merged into `develop`).

## Setting Up GitHub Branch Switching in Lovable

### Prerequisites
1. GitHub repository connected to your Lovable project
2. Both `main` and `develop` branches exist in the repository

### Enable Branch Switching (Per Account)
1. Go to **Account Settings** in Lovable
2. Navigate to **Labs** section
3. Enable **GitHub Branch Switching**
4. This is a per-account setting, not per-project

### Connect Each Project to Its Branch

**Dev Lovable Project:**
1. Open project settings
2. Go to GitHub integration
3. Select `develop` branch

**Prod Lovable Project:**
1. Open project settings
2. Go to GitHub integration
3. Select `main` branch

## Environment Variables

Each Lovable project has its own `.env` file. The `.env` file is NOT synced via GitHub - it's specific to each Lovable project.

### Dev Lovable Project `.env`
```env
VITE_SUPABASE_PROJECT_ID="zkzahqnsfjnvskfywbvg"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpremFocW5zZmpudnNrZnl3YnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDM2NzAsImV4cCI6MjA4MDU3OTY3MH0.MdDuqQdFKXkZOqf0BuXQRFyWAI6ugrBmnqr2wMf31AY"
VITE_SUPABASE_URL="https://zkzahqnsfjnvskfywbvg.supabase.co"
```

### Prod Lovable Project `.env`
```env
VITE_SUPABASE_PROJECT_ID="ogpiovfxjxcclptfybrk"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncGlvdmZ4anhjY2xwdGZ5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTg3NzEsImV4cCI6MjA2OTczNDc3MX0.wWLacGgdAd3tNAKyyigwNK91hvxnP5l4qcPABTQGyqw"
VITE_SUPABASE_URL="https://ogpiovfxjxcclptfybrk.supabase.co"
```

## Development Workflow

### Daily Development
1. All development happens in the **Dev Lovable Project**
2. Changes automatically sync to the `develop` branch on GitHub
3. Test thoroughly in the dev environment

### Promoting to Production
1. When features are ready, create a **Pull Request** from `develop` → `main`
2. Review the changes in the PR
3. Merge the PR
4. The **Prod Lovable Project** automatically syncs with the updated `main` branch
5. Click "Update" in the Prod Lovable project's publish dialog to deploy

### Hotfixes (If Needed)
For urgent production fixes:
1. Create a branch from `main`: `hotfix/description`
2. Make the fix
3. Create PR to `main`, merge
4. Create PR to `develop` to keep branches in sync

## Setting Up a New Production Lovable Project

If you need to create the production Lovable project:

1. **Create New Project**
   - Go to Lovable dashboard
   - Create new project by importing from your GitHub repository

2. **Enable Branch Switching**
   - Account Settings → Labs → Enable GitHub Branch Switching

3. **Connect to `main` Branch**
   - Project Settings → GitHub → Select `main` branch

4. **Configure Environment Variables**
   - Set the production `.env` values (see above)

5. **Connect Domain**
   - Project Settings → Domains → Connect `notanother.coach`

6. **Configure Supabase Connection**
   - Connect to the production Supabase project (`ogpiovfxjxcclptfybrk`)

## Edge Functions & Supabase Secrets

Each Supabase project has its own secrets. Ensure both projects have the required secrets configured:

### Required Secrets (Both Environments)
- `RESEND_API_KEY` - Email service API key
- `STRIPE_SECRET_KEY` - Stripe API key (test key for dev, live key for prod)
- `FROM_EMAIL` - Sender email address
- Any other service-specific secrets

### Configuring Secrets
1. Go to Supabase Dashboard → Settings → Edge Functions
2. Add each required secret
3. Repeat for both dev and prod Supabase projects

## Checklist for Complete Setup

### Dev Environment
- [x] `.env` configured with dev Supabase credentials
- [ ] GitHub Branch Switching enabled in Lovable Labs
- [ ] Project connected to `develop` branch
- [ ] Domain `dev.notanother.coach` connected
- [ ] All Supabase secrets configured

### Prod Environment
- [ ] New Lovable project created
- [ ] GitHub Branch Switching enabled
- [ ] Project connected to `main` branch
- [ ] `.env` configured with prod Supabase credentials
- [ ] Domain `notanother.coach` connected
- [ ] All Supabase secrets configured (with production values)

## Troubleshooting

### Changes Not Syncing
- Verify the correct branch is selected in project settings
- Check GitHub connection status
- Ensure there are no merge conflicts

### Wrong Supabase Backend
- Verify `.env` variables are correctly set
- Check browser console for the Supabase URL being used
- Clear browser cache and reload

### Edge Functions Not Working
- Verify secrets are configured in the correct Supabase project
- Check edge function logs in Supabase Dashboard
- Ensure function is deployed (happens automatically in Lovable)
