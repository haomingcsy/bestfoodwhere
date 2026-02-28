import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/favorites",
  "/reviews",
  "/deals",
  "/settings",
];
const restaurantRoutes = ["/restaurant"];
const adminRoutes = ["/admin"];

// Routes that should redirect authenticated users
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some((route) => pathname.startsWith(route))) {
    // Get user profile to determine redirect destination
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", session.user.id)
      .single();

    const redirectPath = getRedirectPath(profile?.account_type);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Protect routes that require authentication
  if (!session) {
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route),
    );
    const isRestaurantRoute = restaurantRoutes.some((route) =>
      pathname.startsWith(route),
    );
    const isAdminRoute = adminRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isProtectedRoute || isRestaurantRoute || isAdminRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Role-based route protection
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", session.user.id)
      .single();

    // Protect restaurant routes - only restaurant accounts
    if (restaurantRoutes.some((route) => pathname.startsWith(route))) {
      if (profile?.account_type !== "restaurant") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Protect admin routes - only admin accounts
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (profile?.account_type !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Redirect consumers trying to access restaurant dashboard
    if (pathname === "/restaurant" || pathname === "/restaurant/") {
      if (profile?.account_type !== "restaurant") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

function getRedirectPath(accountType?: string): string {
  switch (accountType) {
    case "restaurant":
      return "/restaurant/dashboard";
    case "admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}

export const config = {
  matcher: [
    // Only run auth middleware on routes that need it.
    // Public pages (menu, shopping-malls, cuisine, etc.) skip middleware
    // so they can be edge-cached by Vercel CDN.
    "/dashboard/:path*",
    "/favorites/:path*",
    "/reviews/:path*",
    "/deals/:path*",
    "/settings/:path*",
    "/restaurant/:path*",
    "/admin/:path*",
    "/login",
    "/signup/:path*",
    "/forgot-password",
    "/reset-password",
  ],
};
