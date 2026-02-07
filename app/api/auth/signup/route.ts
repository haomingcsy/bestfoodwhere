import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { AccountType } from "@/types/auth";

interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  accountType: AccountType;
  // Consumer-specific
  dietaryPreferences?: string[];
  favoriteCuisines?: string[];
  // Restaurant-specific
  restaurantName?: string;
  contactPerson?: string;
  businessPhone?: string;
  mallLocation?: string;
  cuisineType?: string;
  website?: string;
  description?: string;
  subscriptionTier?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const supabase = await createSupabaseServerClient();

    // Validate required fields
    if (
      !body.email ||
      !body.password ||
      !body.displayName ||
      !body.accountType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email.trim(),
      password: body.password,
      options: {
        data: {
          display_name: body.displayName.trim(),
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: body.email.trim(),
      display_name: body.displayName.trim(),
      phone: body.phone?.trim() || null,
      account_type: body.accountType,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // Create account-type specific profile
    if (body.accountType === "consumer") {
      await supabase.from("consumer_profiles").insert({
        id: authData.user.id,
        dietary_preferences: body.dietaryPreferences || [],
        favorite_cuisines: body.favoriteCuisines || [],
        email_notifications: true,
        deals_notifications: true,
      });
    } else if (body.accountType === "restaurant") {
      await supabase.from("restaurant_profiles").insert({
        id: authData.user.id,
        restaurant_name: body.restaurantName?.trim() || "",
        contact_person: body.contactPerson?.trim() || body.displayName.trim(),
        business_email: body.email.trim(),
        business_phone: body.businessPhone?.trim() || null,
        mall_location: body.mallLocation || null,
        cuisine_type: body.cuisineType || null,
        website: body.website?.trim() || null,
        description: body.description?.trim() || null,
        subscription_tier: body.subscriptionTier || "basic",
        subscription_status:
          body.subscriptionTier === "basic" ? "active" : null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
