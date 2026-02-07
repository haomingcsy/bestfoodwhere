"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Mail, Calendar, Star } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "basic";
  const restaurant = searchParams.get("restaurant");
  const sessionId = searchParams.get("session_id");

  const tierNames: Record<string, string> = {
    basic: "Basic Listing",
    featured: "Featured Listing",
    premium: "Premium Listing",
    enterprise: "Enterprise",
  };

  const isPaid = tier === "featured" || tier === "premium";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {isPaid ? "Payment Successful!" : "Submission Received!"}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-8">
            {restaurant ? (
              <>
                Thank you for registering{" "}
                <span className="text-[#ff6a3d] font-semibold">
                  {restaurant}
                </span>
              </>
            ) : (
              "Thank you for your submission"
            )}
          </p>

          {/* Plan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff6a3d]/20 text-[#ff6a3d] font-medium mb-12">
            <Star className="w-4 h-4" />
            {tierNames[tier]} Plan
          </div>

          {/* Next Steps */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              What happens next?
            </h2>

            <div className="space-y-6 text-left">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff6a3d]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#ff6a3d]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Confirmation Email
                  </h3>
                  <p className="text-gray-400">
                    You&apos;ll receive a confirmation email with your listing
                    details and next steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff6a3d]/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#ff6a3d]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Review Process</h3>
                  <p className="text-gray-400">
                    Our team will review your submission within 1-2 business
                    days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff6a3d]/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#ff6a3d]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Go Live</h3>
                  <p className="text-gray-400">
                    Once approved, your restaurant will be live on
                    BestFoodWhere.sg!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Session ID for paid transactions */}
          {sessionId && (
            <p className="text-sm text-gray-500 mb-8">
              Transaction ID: {sessionId.slice(0, 20)}...
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] text-white font-semibold hover:shadow-lg hover:shadow-[#ff6a3d]/30 transition-all"
            >
              Explore BestFoodWhere
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
