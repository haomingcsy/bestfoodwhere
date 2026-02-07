/**
 * Recipe Welcome Email API
 * Sends a welcome email to new recipe newsletter subscribers
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  getRecipeWelcomeEmailHtml,
  getRecipeWelcomeEmailText,
} from "@/lib/email/recipe-welcome";

export async function POST(request: NextRequest) {
  // Lazy initialize to avoid build-time errors
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "BestFoodWhere Recipes <recipes@mail.bestfoodwhere.sg>",
      to: email,
      subject: "Welcome to BestFoodWhere Recipes! 🍳",
      html: getRecipeWelcomeEmailHtml(email),
      text: getRecipeWelcomeEmailText(email),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Recipe welcome email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
