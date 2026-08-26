import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all page requests except static assets, image optimization
     * files, and API routes, so the session cookie stays fresh on every
     * navigation. API routes are excluded because they authenticate
     * themselves however is appropriate (e.g. the Stripe webhook verifies
     * a signature, not a user session) rather than relying on this cookie
     * refresh.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
