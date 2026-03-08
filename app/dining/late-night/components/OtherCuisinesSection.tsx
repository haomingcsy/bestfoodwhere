import Image from "next/image";
import Link from "next/link";
const OTHER_DINING_CATEGORIES = [
  { name: "Quick Bites", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", url: "/dining/quick-bites" },
  { name: "Casual Dining", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", url: "/dining/casual-dining" },
  { name: "Fine Dining", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80", url: "/dining/fine-dining" },
  { name: "Family Friendly", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", url: "/dining/family-friendly" },
  { name: "Romantic", image: "https://images.unsplash.com/photo-1529543544287-1d8c30db3a58?auto=format&fit=crop&w=800&q=80", url: "/dining/romantic" },
];

export function OtherCuisinesSection() {
  return (
    <section className="mb-5 rounded-xl bg-white px-5 py-8">
      <div className="mb-5 text-center">
        <h2 className="font-heading text-[26px] font-bold text-bfw-orange">
          Other Dining Categories
        </h2>
        <p className="mt-2 font-body text-base text-[#666]">
          Explore more dining options in Singapore
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {OTHER_DINING_CATEGORIES.map((category) => (
          <Link
            key={category.name}
            href={category.url}
            className="group overflow-hidden rounded-lg bg-white shadow-[0_3px_8px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(239,95,42,0.15)]"
          >
            <div className="relative h-[120px] overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
            <div className="p-3 text-center">
              <h3 className="font-heading text-base font-semibold text-[#333] transition-colors group-hover:text-bfw-orange">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/dining/all"
          className="inline-block rounded-full border-2 border-bfw-orange bg-transparent px-5 py-2.5 font-heading text-[15px] font-semibold text-bfw-orange transition-all hover:-translate-y-0.5 hover:bg-bfw-orange hover:text-white hover:shadow-[0_4px_8px_rgba(239,95,42,0.2)]"
        >
          View All Categories
        </Link>
      </div>
    </section>
  );
}
