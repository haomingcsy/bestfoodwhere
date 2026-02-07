import { IconCheck } from "@/components/layout/icons";

const FEATURES = [
  "Find what you crave in minutes.",
  "Explore cuisines from around the world.",
  "Tailored dining experiences for every occasion.",
  "Find food near you with precision.",
  "Menus, prices, and locations—everything in one place.",
] as const;

export function FeatureList() {
  return (
    <ul className="w-full max-w-[560px] space-y-4">
      {FEATURES.map((text) => (
        <li key={text} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e9efff] text-[#2a77ff]">
            <IconCheck className="h-3.5 w-3.5" />
          </span>
          <span className="font-body text-[15px] leading-[24px] text-black">
            {text}
          </span>
        </li>
      ))}
    </ul>
  );
}
