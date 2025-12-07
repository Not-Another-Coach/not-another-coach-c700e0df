# Environment Sync Guide

## Overview

This project uses a centralized environment configuration to manage differences between Dev and Prod Lovable projects. This eliminates merge conflicts and makes syncing safer.

## Quick Reference

| Environment | Project ID | Supabase URL |
|-------------|------------|--------------|
| **Dev** | `zkzahqnsfjnvskfywbvg` | https://zkzahqnsfjnvskfywbvg.supabase.co |
| **Prod** | `ogpiovfxjxcclptfybrk` | https://ogpiovfxjxcclptfybrk.supabase.co |

## The ONLY File That Differs

**`src/config/environment.ts`** - Change `CURRENT_PROJECT_ID` only:

```typescript
// Dev environment:
const CURRENT_PROJECT_ID = 'zkzahqnsfjnvskfywbvg' as const;

// Prod environment:
const CURRENT_PROJECT_ID = 'ogpiovfxjxcclptfybrk' as const;
```

## Files That Must Be Identical

All other source files should be identical between environments, including:

- ✅ `src/integrations/supabase/client.ts` - Uses ENV_CONFIG
- ✅ `src/hooks/useAuth.tsx` - Uses ENV_CONFIG
- ✅ `src/components/DevEnvironmentBanner.tsx` - Uses ENV_CONFIG
- ✅ `src/components/instagram/InstagramIntegration.tsx` - Uses ENV_CONFIG
- ✅ All other components, hooks, services
- ✅ All edge functions
- ✅ All migration files

## Sync Workflow

### Dev → Prod Sync

1. **In Dev Project**: Make and test your changes
2. **Push to GitHub**: Commit changes from Dev
3. **In Prod Project**: 
   - Pull changes from GitHub
   - **IMPORTANT**: If there's a conflict in `src/config/environment.ts`:
     - Accept the "Current" (prod) version, OR
     - Keep the prod project ID: `ogpiovfxjxcclptfybrk`
4. **Verify**: Check the Dev banner is NOT showing in Prod

### Prod → Dev Sync (Rare)

1. **In Prod Project**: Make changes if needed
2. **Push to GitHub**: Commit changes from Prod
3. **In Dev Project**:
   - Pull changes
   - **IMPORTANT**: Keep the dev project ID: `zkzahqnsfjnvskfywbvg`

## Visual Confirmation

- **Dev Environment**: Shows amber "🚧 Development Environment" banner at top
- **Prod Environment**: No banner shown

## Documentation Components

The following admin/documentation components have hardcoded project references for Supabase dashboard links. These are intentionally pointing to production for admin reference:

- `src/components/documentation/APIDocumentation.tsx`
- `src/components/documentation/DatabaseDocumentation.tsx`
- `src/components/documentation/EngineerGuidelines.tsx`

These are safe because they're just external link URLs for admin reference, not functional code.

## Troubleshooting

### Wrong Database Connected
If you see data from the wrong environment:
1. Check `src/config/environment.ts` for correct `CURRENT_PROJECT_ID`
2. Clear browser localStorage and refresh

### Dev Banner Showing in Prod
1. Verify `CURRENT_PROJECT_ID = 'ogpiovfxjxcclptfybrk'` in prod
2. Hard refresh the page

### Auth Issues After Sync
1. The auth token localStorage key includes the project ID
2. Users may need to re-login after an environment switch
