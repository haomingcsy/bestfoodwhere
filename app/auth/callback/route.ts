import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const intent = searchParams.get("intent") ?? "login";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        // No profile exists - handle based on intent
        if (intent === "login") {
          // User tried to login but doesn't have an account
          // Sign them out and redirect to signup page
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/signup?from=login&message=${encodeURIComponent("No account found. Please create an account first.")}`,
          );
        }

        // Signup intent - redirect to complete profile
        return NextResponse.redirect(
          `${origin}/signup/complete?provider=google`,
        );
      }

      // Existing user - redirect based on account type
      let destination = redirect;
      if (redirect === "/dashboard") {
        if (profile.account_type === "restaurant") {
          destination = "/restaurant/dashboard";
        } else if (profile.account_type === "admin") {
          destination = "/admin";
        }
      }

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
