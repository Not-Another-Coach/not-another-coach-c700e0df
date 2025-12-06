# Database Scripts

This folder contains SQL scripts for environment-specific database operations.

## ⚠️ IMPORTANT: These are NOT migrations

These scripts are meant to be run **manually** via the Supabase SQL Editor.  
They are NOT part of the automated migration system.

## Scripts

### `dev-url-migration.sql`

**Purpose**: Updates storage URLs from production to development Supabase project.

**When to use**: After setting up a new development database (copying schema/data from prod).

**Environment**: ONLY run on DEV database (`zkzahqnsfjnvskfywbvg`)

**⛔ NEVER run this on production!**

## How to Run

1. Open Supabase Dashboard for your **DEV** project
2. Go to SQL Editor
3. Copy the contents of the appropriate script
4. Review the SQL carefully
5. Execute

## Environment Reference

| Environment | Supabase Project ID      |
|-------------|--------------------------|
| Production  | `ogpiovfxjxcclptfybrk`   |
| Development | `zkzahqnsfjnvskfywbvg`   |

## Notes on Existing Migrations

Some existing migrations contain hardcoded production Edge Function URLs for cron jobs. These are environment-specific and will point to production functions even when applied to dev. This is a known limitation - cron jobs in dev will call production edge functions unless manually updated after migration.
