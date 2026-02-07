import Link from "next/link";
import {
  IconGoblet,
  IconHeart,
  IconMoon,
  IconTimer,
  IconUsers,
  IconUtensils,
} from "@/components/layout/icons";

interface DiningOption {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}

const OPTIONS: DiningOption[] = [
  {
    title: "Fine Dining",
    href: "/dining/fine-dining",
    description: "Elegant culinary experiences",
    icon: <IconUtensils className="h-[30px] w-[30px]" />,
  },
  {
    title: "Casual Dining",
    href: "/dining/casual-dining",
    description: "Relaxed everyday meals",
    icon: <IconGoblet className="h-[30px] w-[30px]" />,
  },
  {
    title: "Quick Bites",
    href: "/dining/quick-bites",
    description: "Fast and delicious options",
    icon: <IconTimer className="h-[30px] w-[30px]" />,
  },
  {
    title: "Late Night",
    href: "/dining/late-night",
    description: "Open past midnight",
    icon: <IconMoon className="h-[30px] w-[30px]" />,
  },
  {
    title: "Romantic",
    href: "/dining/romantic",
    description: "Ideal for date nights",
    icon: <IconHeart className="h-[30px] w-[30px]" />,
  },
  {
    title: "Family-Friendly",
    href: "/dining/family-friendly",
    description: "Perfect for family gatherings",
    icon: <IconUsers className="h-[30px] w-[30px]" />,
  },
] as const;

function DiningCard({ option }: { option: DiningOption }) {
  return (
    <Link
      href={option.href}
      className="block rounded-2xl border border-[#f0f0f0] bg-white p-10 text-center shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.1)]"
    >
      <div className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#fff0eb] text-bfw-orange">
        {option.icon}
      </div>
      <h3 className="font-heading text-[20px] font-bold text-[#1a1a1a]">
        {option.title}
      </h3>
      <p className="mt-2 font-body text-[16px] font-medium text-[#666666]">
        {option.description}
      </p>
    </Link>
  );
}

export function DiningOptions() {
  return (
    <section className="w-full bg-white py-12">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-heading text-[28px] font-bold text-[#1a1a1a] md:text-[28px]">
          Dining Options
        </h2>
        <p className="mt-3 font-heading text-[16px] font-medium text-[#666666]">
          Choose from our wide variety of dining experiences
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6">
          {OPTIONS.map((o) => (
            <DiningCard key={o.href} option={o} />
          ))}
        </div>

        <div className="mt-8 text-left max-[480px]:text-center">
          <Link
            href="/dining"
            className="inline-flex items-center gap-1 font-heading text-[16px] font-semibold text-[#1a1a1a] transition-all hover:gap-2"
          >
            View All Dining Options →
          </Link>
        </div>
      </div>
    </section>
  );
}
