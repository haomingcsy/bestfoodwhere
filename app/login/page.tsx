import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Login | BestFoodWhere",
  description: "Sign in to your BestFoodWhere account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding Panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Restaurant ambiance"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-orange-900/60" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-bfw-orange/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full p-12">
          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="font-body text-orange-300 text-sm font-medium tracking-widest uppercase">
                Singapore&apos;s #1 Mall Food Guide
              </p>
              <h1 className="font-heading text-5xl font-bold leading-[1.1] text-white drop-shadow-lg">
                Your next favorite
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-200">
                  meal awaits
                </span>
              </h1>
              <p className="font-body text-lg text-white/70 max-w-md">
                Discover hidden gems, save your favorites, and never wonder
                &quot;where to eat?&quot; again.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {["500+ Restaurants", "50+ Malls", "Real Reviews"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/20"
                  >
                    {feature}
                  </span>
                ),
              )}
            </div>

            {/* Testimonial Card */}
            <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-md">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-body text-white/90 text-sm leading-relaxed mb-4">
                &quot;Finally, a food guide that actually understands mall
                dining in Singapore. Found my new favorite ramen spot through
                BestFoodWhere!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  JT
                </div>
                <div>
                  <p className="font-heading text-white text-sm font-semibold">
                    Jessica Tan
                  </p>
                  <p className="font-body text-white/60 text-xs">
                    Food Enthusiast
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full flex-col lg:w-1/2 bg-gray-50">
        {/* Mobile header */}
        <header className="flex items-center justify-center p-6 lg:hidden">
          <Link href="/">
            <Image
              src="/brand/logo.svg"
              alt="BestFoodWhere"
              width={160}
              height={36}
            />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 lg:px-12">
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-bfw-orange border-t-transparent" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
