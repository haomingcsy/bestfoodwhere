import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

// Force dynamic rendering to always show fresh data
export const dynamic = "force-dynamic";

interface Payment {
  id: string;
  user_id: string | null;
  stripe_payment_id: string | null;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  profiles?: {
    email: string;
    display_name: string | null;
  } | null;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("payments")
    .select(
      `
      *,
      profiles (
        email,
        display_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data: payments } = await query;

  // Calculate totals
  const totalRevenue =
    payments
      ?.filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

  const totalRefunded =
    payments
      ?.filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "refunded":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Payments
          </h1>
          <p className="mt-1 font-body text-gray-600">
            View all payment transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="font-body text-sm text-gray-600">Total Revenue</p>
          <p className="font-heading text-2xl font-bold text-green-600">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="font-body text-sm text-gray-600">Total Refunded</p>
          <p className="font-heading text-2xl font-bold text-gray-500">
            ${(totalRefunded / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="font-body text-sm text-gray-600">Net Revenue</p>
          <p className="font-heading text-2xl font-bold text-bfw-orange">
            ${((totalRevenue - totalRefunded) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Link
          href="/admin/payments"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            !params.status
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/payments?status=succeeded"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.status === "succeeded"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Succeeded
        </Link>
        <Link
          href="/admin/payments?status=failed"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.status === "failed"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Failed
        </Link>
        <Link
          href="/admin/payments?status=refunded"
          className={`rounded-lg px-4 py-2 font-body text-sm transition ${
            params.status === "refunded"
              ? "bg-bfw-orange text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Refunded
        </Link>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-right font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-heading text-xs font-medium uppercase tracking-wider text-gray-500">
                  Invoice ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(payments as Payment[] | null)?.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-body text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                    <p className="font-body text-xs text-gray-500">
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {payment.profiles ? (
                      <div>
                        <p className="font-heading text-sm font-medium text-gray-900">
                          {payment.profiles.display_name || "—"}
                        </p>
                        <p className="font-body text-xs text-gray-500">
                          {payment.profiles.email}
                        </p>
                      </div>
                    ) : (
                      <span className="font-body text-xs text-gray-400">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-body text-sm text-gray-700 max-w-xs truncate">
                      {payment.description || "—"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span className="font-heading text-sm font-semibold text-gray-900">
                      ${(payment.amount / 100).toFixed(2)}
                    </span>
                    <span className="font-body text-xs text-gray-500 ml-1">
                      {payment.currency.toUpperCase()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${getStatusBadge(
                        payment.status,
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {payment.stripe_invoice_id ? (
                      <a
                        href={`https://dashboard.stripe.com/invoices/${payment.stripe_invoice_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs text-bfw-orange hover:underline"
                      >
                        {payment.stripe_invoice_id.substring(0, 20)}...
                      </a>
                    ) : (
                      <span className="font-body text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!payments || payments.length === 0) && (
          <div className="py-12 text-center">
            <p className="font-body text-gray-500">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
