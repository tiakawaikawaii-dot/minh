import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Character = {
  id: string;
  name: string;
  avatar_url: string;
  description: string;
  greeting: string;
  personality: string;
  scenario: string;
  category: string;
  tags: string[];
  creator: string;
  is_public: boolean;
  is_nsfw: boolean;
  chat_count: number;
  like_count: number;
  created_at: string;
};

export type Chat = {
  id: string;
  character_id: string;
  title: string;
  persona_name: string;
  created_at: string;
  updated_at: string;
  branch_from_id: string | null;
  branch_from_message_id: string | null;
};

export type Message = {
  id: string;
  chat_id: string;
  role: 'user' | 'character';
  content: string;
  created_at: string;
};

export type Persona = {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string;
  created_at: string;
};

export type UserSettings = {
  id: string;
  coins: number;
  is_premium: boolean;
  premium_tier: string | null;
  context_mode: 'standard' | 'tale' | 'passion';
  voice_enabled: boolean;
  filter_level: 'flexible' | 'strict';
  nsfw_enabled: boolean;
  age_verified: boolean;
  created_at: string;
};
