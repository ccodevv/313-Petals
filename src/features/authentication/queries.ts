import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/** Redirects to /login if there is no authenticated user. Use at the top of
 * pages/layouts that require any signed-in user. */
export async function requireProfile(redirectTo = "/"): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return profile;
}

/** Redirects non-admins away. RLS already blocks the underlying data, but
 * pages should fail fast with a clear redirect instead of rendering an
 * empty/broken admin screen. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile("/admin");
  if (profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
