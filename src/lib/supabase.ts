import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase publishable keys are intended for browser use. The legacy anon key
// variable remains supported so existing deployments can migrate gradually.
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns null until environment variables are configured.
// Never place a service-role or secret key in this browser-side module.
export const supabase =
  url && publishableKey ? createClient(url, publishableKey) : null;
