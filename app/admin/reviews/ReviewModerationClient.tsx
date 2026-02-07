"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ReviewModerationClient({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleModerate = async (status: "approved" | "rejected") => {
    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("reviews")
      .update({ status })
      .eq("id", reviewId);

    if (error) {
      console.error("Error updating review:", error);
      setIsLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleModerate("approved")}
        disabled={isLoading}
        className="rounded-lg bg-green-600 px-3 py-1.5 font-body text-sm text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => handleModerate("rejected")}
        disabled={isLoading}
        className="rounded-lg bg-red-600 px-3 py-1.5 font-body text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
