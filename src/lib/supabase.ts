import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns null until environment variables are configured. Never place service-role keys here.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
