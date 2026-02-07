import type { ShoppingMall } from "@/types/shopping-mall";
import Link from "next/link";
import { IconFacebook, IconInstagram } from "@/components/layout/icons";

interface Props {
  mall: ShoppingMall;
}

export function MallContactCard({ mall }: Props) {
  const hasContact = mall.phone || mall.facebookUrl || mall.instagramUrl;

  if (!hasContact) return null;

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">
        Contact Information
      </h3>
      <div className="mt-4 space-y-3">
        {mall.phone && (
          <a
            href={`tel:${mall.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 text-bfw-orange hover:underline"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 3.1 4.2 2 2 0 0 1 5.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.6a2 2 0 0 1-.5 2.1L9.1 9.9a16 16 0 0 0 6 6l1.6-1.1a2 2 0 0 1 2.1-.5c.9.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
            </svg>
            <span className="font-medium">{mall.phone}</span>
          </a>
        )}

        {mall.facebookUrl && (
          <Link
            href={mall.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-bfw-orange hover:underline"
          >
            <IconFacebook className="h-5 w-5" />
            <span className="font-medium">
              {
                mall.facebookUrl
                  .replace(/^https?:\/\/(www\.)?/, "")
                  .split("/")[0]
              }
            </span>
          </Link>
        )}

        {mall.instagramUrl && (
          <Link
            href={mall.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-bfw-orange hover:underline"
          >
            <IconInstagram className="h-5 w-5" />
            <span className="font-medium">
              {
                mall.instagramUrl
                  .replace(/^https?:\/\/(www\.)?/, "")
                  .split("/")[0]
              }
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
