import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/user/profile - Get current user's full profile
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get base profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Get account-type specific profile
  let extendedProfile = null;
  if (profile.account_type === "consumer") {
    const { data } = await supabase
      .from("consumer_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    extendedProfile = data;
  } else if (profile.account_type === "restaurant") {
    const { data } = await supabase
      .from("restaurant_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    extendedProfile = data;
  }

  return NextResponse.json({
    user,
    profile,
    extendedProfile,
  });
}

// PATCH /api/user/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    // Base profile fields
    display_name,
    phone,
    avatar_url,
    // Consumer profile fields
    dietary_preferences,
    favorite_cuisines,
    email_notifications,
    deals_notifications,
    // Restaurant profile fields
    restaurant_name,
    contact_person,
    business_email,
    business_phone,
    mall_location,
    cuisine_type,
    website,
    description,
  } = body;

  // Update base profile if any base fields provided
  const baseUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (display_name !== undefined) baseUpdate.display_name = display_name;
  if (phone !== undefined) baseUpdate.phone = phone;
  if (avatar_url !== undefined) baseUpdate.avatar_url = avatar_url;

  if (Object.keys(baseUpdate).length > 1) {
    const { error } = await supabase
      .from("profiles")
      .update(baseUpdate)
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Get account type to determine which extended profile to update
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (profile?.account_type === "consumer") {
    const consumerUpdate: Record<string, unknown> = {};
    if (dietary_preferences !== undefined)
      consumerUpdate.dietary_preferences = dietary_preferences;
    if (favorite_cuisines !== undefined)
      consumerUpdate.favorite_cuisines = favorite_cuisines;
    if (email_notifications !== undefined)
      consumerUpdate.email_notifications = email_notifications;
    if (deals_notifications !== undefined)
      consumerUpdate.deals_notifications = deals_notifications;

    if (Object.keys(consumerUpdate).length > 0) {
      const { error } = await supabase
        .from("consumer_profiles")
        .update(consumerUpdate)
        .eq("id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  } else if (profile?.account_type === "restaurant") {
    const restaurantUpdate: Record<string, unknown> = {};
    if (restaurant_name !== undefined)
      restaurantUpdate.restaurant_name = restaurant_name;
    if (contact_person !== undefined)
      restaurantUpdate.contact_person = contact_person;
    if (business_email !== undefined)
      restaurantUpdate.business_email = business_email;
    if (business_phone !== undefined)
      restaurantUpdate.business_phone = business_phone;
    if (mall_location !== undefined)
      restaurantUpdate.mall_location = mall_location;
    if (cuisine_type !== undefined)
      restaurantUpdate.cuisine_type = cuisine_type;
    if (website !== undefined) restaurantUpdate.website = website;
    if (description !== undefined) restaurantUpdate.description = description;

    if (Object.keys(restaurantUpdate).length > 0) {
      const { error } = await supabase
        .from("restaurant_profiles")
        .update(restaurantUpdate)
        .eq("id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ success: true });
}
