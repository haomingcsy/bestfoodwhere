import Link from "next/link";

interface ComingSoonPageProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoonPage({
  title,
  backHref = "/",
  backLabel = "Back to home",
}: ComingSoonPageProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-2 text-[15px] text-gray-600">Coming soon.</p>
        <div className="mt-6">
          <Link
            href={backHref}
            className="inline-flex items-center text-[15px] font-medium text-bfw-red hover:opacity-90"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

