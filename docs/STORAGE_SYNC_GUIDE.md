# Storage Sync Guide: Copy Images from Prod to Dev

## Problem

After switching the dev Lovable project to use the dev Supabase backend, images are not displaying because:
- **Database records** (file paths) exist in dev Supabase (`zkzahqnsfjnvskfywbvg`)
- **Actual image files** are stored in prod Supabase storage (`ogpiovfxjxcclptfybrk`)

## Solution: Copy Files from Prod to Dev Storage

### Step 1: Access Prod Supabase Storage

1. Go to [Prod Supabase Dashboard](https://supabase.com/dashboard/project/ogpiovfxjxcclptfybrk/storage/buckets/trainer-images)
2. Navigate to **Storage** → **trainer-images** bucket

### Step 2: Download Images from Prod

Download the following trainer folders (each folder is named by trainer_id):

| Trainer ID | Files |
|------------|-------|
| `1051dd7c-ee79-48fd-b287-2cbe7483f9f7` | High protein.png, Health food image.png, Workout.png, Seeds.png |
| `f5562940-ccc4-40c2-b8dd-8f8c22311003` | RUQ Belt 3.jpg, RUQ Vest 2.jpg, RUQ Belt 2.jpg, Vest with sleeves hood.png, RUQ Vest 1.jpg, RUQ Belt.jpg |
| `5193e290-0570-4d77-b46a-e0e21ea0aac3` | ChatGPT Image Sep 12*.png (4 files) |
| `6774690f-7ad4-4d57-aafd-5b75e32ebf66` | IMG_8274.jpeg, IMG_8260.jpeg |
| `dae95227-eb98-4e30-9ec7-a223e542f82a` | Health food image.png |

**Tip**: In Supabase Storage UI, you can select multiple files and use "Download" to get them.

### Step 3: Upload Images to Dev Supabase Storage

1. Go to [Dev Supabase Dashboard](https://supabase.com/dashboard/project/zkzahqnsfjnvskfywbvg/storage/buckets/trainer-images)
2. Navigate to **Storage** → **trainer-images** bucket
3. Create folders for each trainer_id if they don't exist
4. Upload the downloaded files to their respective folders

**Important**: The file paths must match exactly:
```
trainer-images/
├── 1051dd7c-ee79-48fd-b287-2cbe7483f9f7/
│   ├── 1757080770686.png
│   ├── 1757086473983.png
│   ├── 1757087378049.png
│   └── 1757080769620.png
├── f5562940-ccc4-40c2-b8dd-8f8c22311003/
│   ├── 1756314721515.jpg
│   ├── 1756314722198.jpg
│   └── ... (other files)
└── ... (other trainers)
```

### Step 4: Verify

1. Refresh the demo page at `dev.notanother.coach`
2. Images should now display correctly

## Alternative: Bulk Download/Upload via CLI

If you have Supabase CLI installed:

```bash
# Download from prod
supabase storage cp -r supabase://trainer-images ./trainer-images-backup \
  --project-ref ogpiovfxjxcclptfybrk

# Upload to dev
supabase storage cp -r ./trainer-images-backup supabase://trainer-images \
  --project-ref zkzahqnsfjnvskfywbvg
```

## Future Consideration

For ongoing development, consider:
1. **Re-uploading images in dev**: When testing trainer flows, upload fresh images
2. **Seed data script**: Create a script that populates dev with test data
3. **Keep data separate**: Dev and prod should eventually have independent test data

## Quick Reference: Storage URLs

| Environment | Storage URL Pattern |
|-------------|---------------------|
| **Dev** | `https://zkzahqnsfjnvskfywbvg.supabase.co/storage/v1/object/public/trainer-images/{path}` |
| **Prod** | `https://ogpiovfxjxcclptfybrk.supabase.co/storage/v1/object/public/trainer-images/{path}` |
