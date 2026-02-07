import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ReviewModerationClient } from "./ReviewModerationClient";

interface Review {
  id: string;
  user_id: string;
  brand_slug: string;
  location_slug: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  status: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    email: string;
  };
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("reviews")
    .select(
      `
      *,
      profiles (
        display_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data: reviews } = await query;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Reviews
          </h1>
          <p className="mt-1 font-body text-gray-600">Moderate user reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Link
          href="/admin/reviews"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            !params.status
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/reviews?status=pending"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.status === "pending"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending
        </Link>
        <Link
          href="/admin/reviews?status=approved"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.status === "approved"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Approved
        </Link>
        <Link
          href="/admin/reviews?status=rejected"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.status === "rejected"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Rejected
        </Link>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {(reviews as Review[] | null)?.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${getStatusBadge(
                      review.status,
                    )}`}
                  >
                    {review.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <h3 className="font-heading text-lg font-semibold text-gray-900">
                  {review.title || "Untitled Review"}
                </h3>
                <p className="mt-1 font-body text-sm text-gray-600">
                  {review.content || "No content"}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    By:{" "}
                    {review.profiles?.display_name || review.profiles?.email}
                  </span>
                  <span>Restaurant: {review.brand_slug}</span>
                  <span>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {review.status === "pending" && (
                <ReviewModerationClient reviewId={review.id} />
              )}
            </div>
          </div>
        ))}

        {(!reviews || reviews.length === 0) && (
          <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
            <p className="font-body text-gray-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}
