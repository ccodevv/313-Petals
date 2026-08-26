import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Bypasses Row Level Security entirely - only for trusted server-to-server
 * contexts with no user session to check RLS against, such as a verified
 * Stripe webhook confirming a payment. Never call this from anything that
 * handles a request on behalf of a signed-in user; use
 * `@/lib/supabase/server` for that so RLS still applies.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
