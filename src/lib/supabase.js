import { createClient } from "@supabase/supabase-js";

const runtimeConfig = globalThis.__PUSHA_ENV__ || {};
const supabaseUrl = runtimeConfig.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  runtimeConfig.VITE_SUPABASE_PUBLISHABLE_KEY ||
  runtimeConfig.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);
export const supabaseConfigError = hasSupabaseConfig
  ? ""
  : "Add Supabase config with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY at build time, or provide them in /runtime-config.js. Older Supabase projects can use VITE_SUPABASE_ANON_KEY instead.";

export const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseKey) : null;
