import type { SocialLinks } from "@/types/brand";
import Link from "next/link";

interface Props {
  socialLinks: SocialLinks;
}

export function SocialLinksCard({ socialLinks }: Props) {
  const items = [
    { key: "facebook", label: "Facebook", href: socialLinks.facebook },
    { key: "instagram", label: "Instagram", href: socialLinks.instagram },
    { key: "linkedin", label: "LinkedIn", href: socialLinks.linkedin },
  ].filter((item) => Boolean(item.href));

  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-semibold text-gray-900">Social</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href as string}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-xl border border-border bg-white px-3 text-xs font-semibold text-gray-900 hover:bg-[#fff9f6]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

