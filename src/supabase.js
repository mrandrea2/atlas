import { createClient } from "@supabase/supabase-js";

// La anon key è pensata per stare nel frontend: la sicurezza è garantita
// dalle policy RLS lato database (vedi supabase/schema.sql).
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);
export const supabase = supabaseEnabled ? createClient(url, key) : null;
