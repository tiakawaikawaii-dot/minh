/*
# PolyBuzz - Character Chat & Roleplay Schema

## Overview
Creates the full database schema for a PolyBuzz-style character chat and roleplay app.
No authentication required (single-tenant / no-auth app) — all data is shared/public.

## New Tables

### characters
- `id` (uuid, PK)
- `name` (text) — character name
- `avatar_url` (text) — profile image URL
- `description` (text) — short description shown in cards
- `greeting` (text) — first message the character sends
- `personality` (text) — personality traits and backstory
- `scenario` (text) — roleplay scenario/context
- `category` (text) — e.g. "Anime", "Fantasy", "Romance", "Adventure", "Sci-Fi"
- `tags` (text[]) — searchable tags
- `creator` (text) — creator display name
- `is_public` (boolean, default true)
- `chat_count` (bigint, default 0) — number of chats started
- `like_count` (bigint, default 0) — number of likes
- `created_at` (timestamptz)

### chats
- `id` (uuid, PK)
- `character_id` (uuid, FK → characters)
- `title` (text) — chat title
- `persona_name` (text) — which persona is being used
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### messages
- `id` (uuid, PK)
- `chat_id` (uuid, FK → chats)
- `role` (text) — 'user' or 'character'
- `content` (text)
- `created_at` (timestamptz)

### personas
- `id` (uuid, PK)
- `name` (text) — persona name
- `avatar_url` (text) — persona avatar
- `description` (text) — persona description
- `created_at` (timestamptz)

### user_settings
- `id` (uuid, PK, default gen_random_uuid())
- `coins` (integer, default 100) — virtual currency
- `is_premium` (boolean, default false)
- `premium_tier` (text, nullable) — 'standard' or 'pro'
- `context_mode` (text, default 'standard') — 'standard', 'tale', 'passion'
- `voice_enabled` (boolean, default true)
- `filter_level` (text, default 'flexible') — 'flexible' or 'strict'
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because this is a no-auth single-tenant app where all data is intentionally shared/public.
*/

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text NOT NULL,
  description text NOT NULL,
  greeting text NOT NULL DEFAULT 'Olá! Como você está?',
  personality text NOT NULL DEFAULT '',
  scenario text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Original',
  tags text[] DEFAULT '{}',
  creator text NOT NULL DEFAULT 'Comunidade',
  is_public boolean NOT NULL DEFAULT true,
  chat_count bigint NOT NULL DEFAULT 0,
  like_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_characters" ON characters;
CREATE POLICY "anon_select_characters" ON characters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_characters" ON characters;
CREATE POLICY "anon_insert_characters" ON characters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_characters" ON characters;
CREATE POLICY "anon_update_characters" ON characters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_characters" ON characters;
CREATE POLICY "anon_delete_characters" ON characters FOR DELETE
  TO anon, authenticated USING (true);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nova Conversa',
  persona_name text DEFAULT 'Eu',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chats" ON chats;
CREATE POLICY "anon_select_chats" ON chats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chats" ON chats;
CREATE POLICY "anon_insert_chats" ON chats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chats" ON chats;
CREATE POLICY "anon_update_chats" ON chats FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chats" ON chats;
CREATE POLICY "anon_delete_chats" ON chats FOR DELETE
  TO anon, authenticated USING (true);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'character')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

-- Personas table
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_personas" ON personas;
CREATE POLICY "anon_select_personas" ON personas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_personas" ON personas;
CREATE POLICY "anon_insert_personas" ON personas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_personas" ON personas;
CREATE POLICY "anon_update_personas" ON personas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_personas" ON personas;
CREATE POLICY "anon_delete_personas" ON personas FOR DELETE
  TO anon, authenticated USING (true);

-- User settings table (single row)
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coins integer NOT NULL DEFAULT 100,
  is_premium boolean NOT NULL DEFAULT false,
  premium_tier text,
  context_mode text NOT NULL DEFAULT 'standard',
  voice_enabled boolean NOT NULL DEFAULT true,
  filter_level text NOT NULL DEFAULT 'flexible',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_user_settings" ON user_settings;
CREATE POLICY "anon_select_user_settings" ON user_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_settings" ON user_settings;
CREATE POLICY "anon_insert_user_settings" ON user_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_settings" ON user_settings;
CREATE POLICY "anon_update_user_settings" ON user_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_settings" ON user_settings;
CREATE POLICY "anon_delete_user_settings" ON user_settings FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_characters_category ON characters(category);
CREATE INDEX IF NOT EXISTS idx_chats_character_id ON chats(character_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
