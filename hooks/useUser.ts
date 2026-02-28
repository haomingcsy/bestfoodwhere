"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AccountType, SubscriptionTier } from "@/types/auth";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  account_type: AccountType;
  created_at: string;
  updated_at: string;
}

interface ConsumerProfile {
  id: string;
  dietary_preferences: string[] | null;
  favorite_cuisines: string[] | null;
  email_notifications: boolean;
  deals_notifications: boolean;
}

interface RestaurantProfile {
  id: string;
  restaurant_name: string;
  contact_person: string;
  business_email: string | null;
  business_phone: string | null;
  mall_location: string | null;
  cuisine_type: string | null;
  website: string | null;
  description: string | null;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: string | null;
  ghl_contact_id: string | null;
}

interface UserState {
  profile: Profile | null;
  consumerProfile: ConsumerProfile | null;
  restaurantProfile: RestaurantProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUser() {
  const [state, setState] = useState<UserState>({
    profile: null,
    consumerProfile: null,
    restaurantProfile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({
          profile: null,
          consumerProfile: null,
          restaurantProfile: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch base profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      let consumerProfile = null;
      let restaurantProfile = null;

      // Fetch extended profile based on account type
      if (profile.account_type === "consumer") {
        const { data } = await supabase
          .from("consumer_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        consumerProfile = data;
      } else if (profile.account_type === "restaurant") {
        const { data } = await supabase
          .from("restaurant_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        restaurantProfile = data;
      }

      setState({
        profile,
        consumerProfile,
        restaurantProfile,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    // Listen for auth changes
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;

      await fetchProfile();
    },
    [fetchProfile],
  );

  const updateConsumerProfile = useCallback(
    async (updates: Partial<ConsumerProfile>) => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("consumer_profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await fetchProfile();
    },
    [fetchProfile],
  );

  const updateRestaurantProfile = useCallback(
    async (updates: Partial<RestaurantProfile>) => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("restaurant_profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await fetchProfile();
    },
    [fetchProfile],
  );

  return {
    ...state,
    refetch: fetchProfile,
    updateProfile,
    updateConsumerProfile,
    updateRestaurantProfile,
    isConsumer: state.profile?.account_type === "consumer",
    isRestaurant: state.profile?.account_type === "restaurant",
    isAdmin: state.profile?.account_type === "admin",
  };
}
