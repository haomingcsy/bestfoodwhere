"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Linkedin,
  Instagram,
  Quote,
  Check,
  Search,
  Globe,
  Smartphone,
  Handshake,
} from "lucide-react";

// Timeline data
const TIMELINE = [
  {
    year: "2020",
    title: "The Beginning",
    description:
      "Founded by three passionate foodies, BestFoodWhere began as a simple spreadsheet of favorite mall restaurants. Frustrated by outdated and incomplete information on existing platforms, we decided to build something better for Singapore's food lovers.",
    stat: "3 Shopping Malls",
  },
  {
    year: "2021",
    title: "Rapid Growth",
    description:
      "Our user-friendly approach struck a chord with Singaporeans. We expanded our team to 10 people, launched our beta website, and began categorizing listings by cuisine, neighborhood, and dining style. Our postal code search feature was introduced, becoming an instant hit.",
    stat: "8 Shopping Malls",
  },
  {
    year: "2022",
    title: "Feature Expansion",
    description:
      "We perfected our comprehensive mall dining guides, helping shoppers find the best food options in Singapore's shopping centers. Our team grew to 20 passionate food experts who personally visited and reviewed venues across the island.",
    stat: "12 Shopping Malls",
  },
  {
    year: "2023",
    title: "Strategic Partnerships",
    description:
      "BestFoodWhere partnered with major restaurants, food delivery services, and tourism boards to expand our offerings. We introduced exclusive deals and promotions, helping diners save while supporting mall restaurants during challenging economic times.",
    stat: "15 Shopping Malls",
  },
  {
    year: "2024",
    title: "Singapore's #1 Mall Dining Platform",
    description:
      "BestFoodWhere became Singapore's largest and most trusted mall dining discovery platform. With over 10,000 meticulously curated restaurant listings across every cuisine and budget range, we're proud to be the go-to resource for locals and tourists alike.",
    stat: "19 Shopping Malls",
  },
  {
    year: "2025",
    title: "Platform Evolution",
    description:
      "Launching our mobile app with personalized recommendations and real-time notifications. Expanding beyond malls to include standalone restaurants, hawker centers, and food courts across Singapore. Introducing AI-powered food discovery features.",
    stat: "25+ Shopping Malls",
  },
  {
    year: "2026",
    title: "Regional Expansion",
    description:
      "Taking BestFoodWhere to Southeast Asia, starting with Kuala Lumpur, Bangkok, and Jakarta. Our vision is to become the region's premier food discovery platform while maintaining the local expertise that makes us special.",
    stat: "SEA Launch",
  },
];

// Team data
const TEAM_MEMBERS = [
  {
    name: "Alex Tan",
    role: "Founder & CEO",
    bio: "Former tech consultant and lifelong foodie who turned his passion for Singapore's diverse food scene into a mission to help others discover hidden culinary gems within shopping malls.",
    gradient: "from-gray-700 to-gray-900",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Mei Lin",
    role: "Head of Content",
    bio: "Former food blogger with a keen eye for detail and a passion for food photography. Mei ensures our mall restaurant listings are accurate, comprehensive, and visually appealing.",
    gradient: "from-purple-600 to-purple-800",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Raj Kumar",
    role: "Tech Lead",
    bio: "Full-stack developer with a passion for creating seamless user experiences. Raj is the architect behind our powerful search features and postal code finder for mall restaurants.",
    gradient: "from-blue-600 to-blue-800",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
];

// Values data
const VALUES = [
  {
    icon: "🍽️",
    title: "Food Passion",
    description:
      "We're food lovers first and foremost. Our team is passionate about Singapore's diverse culinary landscape and committed to helping others experience it to the fullest.",
  },
  {
    icon: "✓",
    title: "Accuracy & Trust",
    description:
      "We obsess over getting the details right. From opening hours to menu highlights, we verify information regularly to ensure our platform is reliable and trustworthy.",
  },
  {
    icon: "🔍",
    title: "Discovery & Innovation",
    description:
      "We're constantly exploring new ways to help users discover great food. From our postal code search to our mall guides, we innovate to make food discovery effortless.",
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    quote:
      "BestFoodWhere has completely changed how I discover new restaurants in Singapore. The mall directory feature is brilliant - I've found amazing places in malls I visit regularly but never knew existed!",
    name: "Sarah L.",
    role: "Food Blogger",
  },
  {
    quote:
      "As a restaurant owner in Jewel Changi, I've seen a significant increase in customers since listing on BestFoodWhere. Their commitment to accuracy and regular updates means our information is always current.",
    name: "Michael C.",
    role: "Restaurant Owner",
  },
];

// Future plans
const FUTURE_PLANS = [
  {
    icon: Globe,
    title: "Beyond Mall Dining",
    description:
      "We're expanding our platform to include standalone restaurants, food courts, cafes, and more across Singapore, giving you comprehensive coverage of the entire food scene.",
  },
  {
    icon: Smartphone,
    title: "Enhanced Mobile Experience",
    description:
      "Our upcoming mobile app will feature personalized recommendations, offline access to favorite restaurants, and real-time notifications for new openings and deals.",
  },
  {
    icon: Handshake,
    title: "Regional Expansion",
    description:
      "We're planning to bring the BestFoodWhere experience to more cities across Southeast Asia, starting with Kuala Lumpur, Bangkok, and Jakarta in 2025-2026.",
  },
];

// Food highlight images
const FOOD_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
    alt: "Gourmet Burger",
  },
  {
    src: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80",
    alt: "Fresh Sushi",
  },
  {
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    alt: "Classic Pizza",
  },
  {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    alt: "Healthy Bowl",
  },
];

export default function OurStoryPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] py-20">
        {/* Background circles */}
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-pulse rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-[10%] h-48 w-48 animate-pulse rounded-full bg-white/10 delay-300" />
        <div className="absolute right-[-50px] top-[20%] h-36 w-36 animate-pulse rounded-full bg-white/10 delay-700" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-6 text-5xl font-extrabold text-white md:text-6xl">
            Our{" "}
            <span className="rounded-lg bg-white px-4 py-1 text-[#ff6a3d]">
              Story
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-xl text-white/90">
            From a small idea to Singapore&apos;s largest mall dining discovery
            platform - join us on our journey of connecting food lovers with
            exceptional dining experiences.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { value: "2020", label: "Founded" },
              { value: "10K+", label: "Food Listings" },
              { value: "19", label: "Shopping Malls" },
            ].map((stat, i) => (
              <div
                key={i}
                className="min-w-[180px] rounded-xl bg-white p-6 shadow-lg transition hover:-translate-y-2"
              >
                <div className="text-5xl font-extrabold text-[#ff6a3d]">
                  {stat.value}
                </div>
                <div className="mt-2 font-semibold text-gray-700">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Mission */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
              <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66]" />
              <h2 className="relative mb-6 text-3xl font-bold text-gray-900">
                Our Mission
                <span className="absolute -bottom-2 left-0 h-1 w-16 bg-[#ff6a3d]" />
              </h2>
              <p className="mb-4 text-gray-600">
                At BestFoodWhere, we&apos;re on a mission to make mall dining
                discovery in Singapore{" "}
                <span className="font-bold text-[#ff6a3d]">
                  effortless and exciting
                </span>
                . We believe everyone deserves to find their perfect dining
                experience without the frustration of outdated information or
                limited options.
              </p>
              <p className="text-gray-600">
                Our platform connects food lovers with{" "}
                <span className="font-bold text-[#ff6a3d]">
                  comprehensive, accurate, and up-to-date
                </span>{" "}
                information about Singapore&apos;s vibrant shopping mall
                restaurants - from casual eateries to fine dining and everything
                in between.
              </p>
              <div className="absolute bottom-6 right-6 text-6xl opacity-10">
                🍽️
              </div>
            </div>

            {/* Vision */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
              <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#ff8c66] to-[#ff6a3d]" />
              <h2 className="relative mb-6 text-3xl font-bold text-gray-900">
                Our Vision
                <span className="absolute -bottom-2 left-0 h-1 w-16 bg-[#ff6a3d]" />
              </h2>
              <p className="mb-4 text-gray-600">
                We envision a Singapore where{" "}
                <span className="font-bold text-[#ff6a3d]">
                  no great restaurant goes undiscovered
                </span>
                . Where dining establishments thrive through increased
                visibility, and where food lovers can easily find exactly what
                they&apos;re craving, whenever and wherever they are.
              </p>
              <p className="text-gray-600">
                By 2026, we aim to be{" "}
                <span className="font-bold text-[#ff6a3d]">
                  Southeast Asia&apos;s premier food discovery platform
                </span>
                , expanding beyond shopping malls to cover all dining categories
                while maintaining the local expertise that makes BestFoodWhere
                special.
              </p>
              <div className="absolute bottom-6 right-6 text-6xl opacity-10">
                🚀
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline Section */}
      <section className="bg-[#f8f5f2] py-24">
        <div className="relative mx-auto max-w-5xl px-4">
          {/* Decorative elements */}
          <div className="absolute -right-36 -top-36 h-72 w-72 rounded-full bg-gradient-to-br from-[#ff6a3d]/20 to-[#ff8c66]/20" />
          <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-gradient-to-br from-[#ff6a3d]/10 to-[#ff8c66]/10" />

          <div className="relative">
            <h2 className="relative mb-16 text-center text-4xl font-extrabold text-gray-900 md:text-5xl">
              Our Journey
              <span className="absolute -bottom-4 left-1/2 h-1 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ff6a3d] to-transparent" />
            </h2>

            {/* Timeline */}
            <div className="relative">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 hidden h-full w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#ff6a3d] to-[#ff8c66] md:block" />

              {TIMELINE.map((item, i) => (
                <div key={i} className="relative mb-16 last:mb-0 md:mb-20">
                  {/* Circle on timeline */}
                  <div className="absolute left-1/2 top-4 hidden h-8 w-8 -translate-x-1/2 rounded-full border-[6px] border-[#ff6a3d] bg-white shadow-md md:block" />

                  {/* Content */}
                  <div
                    className={`relative rounded-xl bg-white p-6 shadow-lg md:w-[45%] ${
                      i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    {/* Arrow */}
                    <div
                      className={`absolute top-5 hidden h-0 w-0 border-y-[12px] border-y-transparent md:block ${
                        i % 2 === 0
                          ? "-right-3 border-l-[12px] border-l-white"
                          : "-left-3 border-r-[12px] border-r-white"
                      }`}
                    />
                    <h3 className="mb-3 text-2xl font-bold text-[#ff6a3d]">
                      {item.year}: {item.title}
                    </h3>
                    <p className="mb-4 text-gray-600">{item.description}</p>
                    <span className="inline-block rounded-full bg-[#ff6a3d]/10 px-4 py-2 text-sm font-semibold text-[#ff6a3d]">
                      {item.stat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-4xl font-extrabold text-gray-900 md:text-5xl">
            The Faces Behind BestFoodWhere
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-xl text-gray-600">
            Meet our passionate team of food enthusiasts, tech innovators, and
            customer experience experts who work tirelessly to connect you with
            Singapore&apos;s best dining experiences.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={i}
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div
                  className={`relative h-52 bg-gradient-to-br ${member.gradient}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#ff6a3d]/90 to-transparent" />
                </div>
                <div className="relative p-6">
                  <div className="absolute -top-7 right-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#ff6a3d] shadow-lg">
                    <span className="text-xl text-white">
                      {i === 0 ? "👨‍💼" : i === 1 ? "👩‍💼" : "👨‍💻"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="mb-4 font-semibold text-[#ff6a3d]">
                    {member.role}
                  </p>
                  <p className="mb-6 text-gray-600">{member.bio}</p>
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6a3d]/10 text-[#ff6a3d] transition hover:bg-[#ff6a3d]/20"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href="#"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6a3d]/10 text-[#ff6a3d] transition hover:bg-[#ff6a3d]/20"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-4xl font-extrabold text-white md:text-5xl">
            Connect With Us
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-xl text-white/80">
            Join our vibrant community of food lovers on social media for the
            latest mall dining updates, exclusive deals, mouthwatering food
            photography, and behind-the-scenes content.
          </p>

          {/* Social Cards */}
          <div className="mb-16 flex flex-wrap justify-center gap-8">
            {[
              {
                name: "Facebook",
                color: "from-[#3b5998] to-[#2d4373]",
                title: "Join Our Community",
                description:
                  "Daily updates on new restaurant openings, exclusive deals, and community discussions on the best mall dining spots.",
              },
              {
                name: "Instagram",
                color: "from-[#f09433] via-[#dc2743] to-[#bc1888]",
                title: "Visual Food Journey",
                description:
                  "Stunning food photography, behind-the-scenes glimpses of Singapore's best mall restaurants, and foodie inspiration.",
              },
              {
                name: "Pinterest",
                color: "from-[#e60023] to-[#d00b20]",
                title: "Food Inspiration Boards",
                description:
                  "Curated collections of Singapore's most photogenic dishes, mall dining guides, and themed food boards to inspire your next meal.",
              },
            ].map((social, i) => (
              <a
                key={i}
                href="#"
                className="block w-full max-w-xs overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div
                  className={`flex h-40 items-center justify-center bg-gradient-to-br ${social.color}`}
                >
                  <span className="text-4xl font-bold text-white">
                    {social.name}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-white">
                    {social.title}
                  </h3>
                  <p className="mb-4 text-sm text-white/70">
                    {social.description}
                  </p>
                  <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                    Follow Us
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Food Highlights */}
          <div className="text-center">
            <div className="mb-8 flex items-center justify-center gap-3">
              <span className="h-0.5 w-10 bg-gradient-to-r from-transparent to-[#ff6a3d]" />
              <span className="text-xl text-white">Food Highlights</span>
              <span className="h-0.5 w-10 bg-gradient-to-l from-transparent to-[#ff6a3d]" />
            </div>

            <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {FOOD_IMAGES.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <span className="absolute bottom-3 left-3 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                    {img.alt}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="https://www.instagram.com/bestfoodwhere/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border-2 border-[#ff6a3d] px-8 py-3 font-semibold text-white transition hover:bg-[#ff6a3d]"
            >
              Follow Us On Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="relative mb-6 text-center text-4xl font-extrabold text-gray-900 md:text-5xl">
            Our Core Values
            <span className="absolute -bottom-4 left-1/2 h-1 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ff6a3d] to-transparent" />
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-xl text-gray-600">
            The principles that guide everything we do at BestFoodWhere and
            shape our approach to mall dining discovery in Singapore.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {VALUES.map((value, i) => (
              <div
                key={i}
                className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg"
              >
                <div className="mb-6 text-5xl">{value.icon}</div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-4xl font-extrabold text-gray-900 md:text-5xl">
            What Our Users Say
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-xl text-gray-600">
            The real stories from food lovers who use BestFoodWhere to discover
            Singapore&apos;s amazing mall dining scene.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <div
                key={i}
                className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg"
              >
                <div className="absolute -top-5 left-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6a3d] shadow-lg">
                  <Quote className="h-5 w-5 text-white" />
                </div>
                <p className="mb-6 text-lg italic text-gray-600">
                  {testimonial.quote}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="text-[#ff6a3d]">★★★★★</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-4xl font-extrabold text-gray-900 md:text-5xl">
            Looking to the Future
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-xl text-gray-600">
            As we continue to grow, our mission remains the same: connecting
            food lovers with exceptional dining experiences. Here&apos;s
            what&apos;s next for BestFoodWhere:
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-8">
            {FUTURE_PLANS.map((plan, i) => (
              <div
                key={i}
                className="w-full max-w-sm rounded-2xl border-t-4 border-[#ff6a3d] bg-white p-8 shadow-lg"
              >
                <div className="mb-4 text-4xl">
                  {i === 0 ? "🌏" : i === 1 ? "📱" : "🤝"}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  {plan.title}
                </h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact-us"
              className="inline-block rounded-full bg-gradient-to-r from-[#ff6a3d] to-[#ff8c66] px-8 py-4 font-semibold text-white shadow-lg shadow-[#ff6a3d]/30 transition hover:-translate-y-1 hover:shadow-xl"
            >
              Join Us On This Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="mx-auto mb-20 max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff6a3d] to-[#ff8c66] p-12 text-center">
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='15' fill='white' fill-opacity='0.3'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Join Singapore&apos;s Largest Food Community
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Subscribe to our newsletter for exclusive food deals, hidden gems,
              and mouthwatering new openings across Singapore before anyone
              else.
            </p>

            <form className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Your Email Address"
                className="flex-1 rounded-full px-6 py-4 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="rounded-full bg-gray-900 px-8 py-4 font-semibold text-white transition hover:bg-gray-800"
              >
                Subscribe
              </button>
            </form>

            <label className="mt-4 flex items-center justify-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-gray-900"
              />
              I agree to receive your newsletters and accept the data privacy
              statement.
            </label>
          </div>
        </div>
      </section>
    </main>
  );
}
