import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);
export const supabaseConfigError = hasSupabaseConfig
  ? ""
  : "Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env before signing in. Older Supabase projects can use VITE_SUPABASE_ANON_KEY instead.";

export const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseKey) : null;
