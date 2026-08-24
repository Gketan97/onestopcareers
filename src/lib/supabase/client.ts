import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fails soft, not loud — Jobs/Companies browsing must keep working even
// before real Supabase credentials exist (or if they're ever briefly
// misconfigured). `supabase` is null rather than throwing; every caller
// (useAuth, useSavedJobs, the interest form) checks for null and shows
// an honest "not available right now" state instead of crashing the
// whole app over a missing env var.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

if (!supabase && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — auth, saved jobs, and Career Circle submissions are disabled. Copy .env.example to .env.local and fill in real values.',
  )
}
