import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for contacting BestFoodWhere. We'll get back to you soon!",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] to-white">
      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        {/* Success Icon */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-[0_15px_40px_rgba(34,197,94,0.3)]">
          <svg
            className="h-12 w-12 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="mb-4 font-heading text-4xl font-extrabold text-[#333] md:text-5xl">
          Thank You!
        </h1>

        <p className="mb-8 max-w-lg font-body text-lg leading-relaxed text-[#555] md:text-xl">
          Your message has been received successfully. Our team will review your inquiry and get
          back to you within 1-2 business days.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-bfw-orange to-[#ff8c66] px-8 py-4 font-heading text-lg font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,106,61,0.4)]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </Link>

          <a
            href="https://wa.me/6582233005"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-8 py-4 font-heading text-lg font-semibold text-white shadow-[0_10px_30px_rgba(37,211,102,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(37,211,102,0.4)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Need Urgent Help?
          </a>
        </div>

        {/* What's Next Section */}
        <div className="mt-16 w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <h2 className="mb-6 font-heading text-2xl font-bold text-[#333]">What happens next?</h2>
          <div className="grid gap-6 text-left md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 font-heading text-lg font-bold text-bfw-orange">
                1
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-[#333]">Review</h3>
                <p className="mt-1 font-body text-sm text-[#666]">
                  Our team reviews your message within 24 hours
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 font-heading text-lg font-bold text-bfw-orange">
                2
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-[#333]">Response</h3>
                <p className="mt-1 font-body text-sm text-[#666]">
                  We&apos;ll reply via email with relevant information
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bfw-orange/10 font-heading text-lg font-bold text-bfw-orange">
                3
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-[#333]">Follow-up</h3>
                <p className="mt-1 font-body text-sm text-[#666]">
                  Schedule a call if needed for detailed discussion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
