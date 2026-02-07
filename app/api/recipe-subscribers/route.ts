/**
 * Recipe Newsletter Subscribers API
 *
 * Saves recipe newsletter subscribers to Supabase and sends welcome email
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  getRecipeWelcomeEmailHtml,
  getRecipeWelcomeEmailText,
} from "@/lib/email/recipe-welcome";

export async function POST(request: NextRequest) {
  // Lazy initialize to avoid build-time errors
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("recipe_subscribers")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    const isNew = !existing;

    // Upsert subscriber
    const { data, error } = await supabase
      .from("recipe_subscribers")
      .upsert(
        {
          email: normalizedEmail,
          subscribed_at: new Date().toISOString(),
          source_url:
            request.headers.get("referer") || request.headers.get("origin"),
        },
        { onConflict: "email" },
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save subscriber" },
        { status: 500 },
      );
    }

    // Send welcome email only for new subscribers
    if (isNew) {
      try {
        await resend.emails.send({
          from: "BestFoodWhere Recipes <recipes@bestfoodwhere.sg>",
          to: normalizedEmail,
          subject: "Welcome to BestFoodWhere Recipes! 🍳",
          html: getRecipeWelcomeEmailHtml(normalizedEmail),
          text: getRecipeWelcomeEmailText(normalizedEmail),
        });
      } catch (emailError) {
        // Log but don't fail the subscription
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      subscriber: data,
      isNew,
    });
  } catch (error) {
    console.error("Recipe subscriber API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "recipe-subscribers",
    timestamp: new Date().toISOString(),
  });
}
