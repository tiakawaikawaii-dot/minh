/*
# Add NSFW and Age Verification Columns

## Overview
Adds NSFW content toggle and age verification tracking to user_settings.
Also adds nsfw filter to characters table for content categorization.

## Changes
### user_settings
- `nsfw_enabled` (boolean, default true) — enables uncensored +18 content
- `age_verified` (boolean, default false) — tracks if user confirmed 18+

### characters
- `is_nsfw` (boolean, default false) — marks character as adult content

## Security
- No policy changes needed — existing policies already allow full anon/authenticated CRUD.
*/

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS nsfw_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS age_verified boolean NOT NULL DEFAULT false;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS is_nsfw boolean NOT NULL DEFAULT false;
