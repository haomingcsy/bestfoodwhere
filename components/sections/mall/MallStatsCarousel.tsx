"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  {
    icon: (
      <svg
        className="h-6 w-6 text-bfw-red"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    ),
    value: "19",
    label: "Total Shopping Malls",
  },
  {
    icon: (
      <svg
        className="h-6 w-6 text-bfw-red"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2" />
        <path d="M18 15V2" />
        <path d="M3 13v9" />
      </svg>
    ),
    value: "2,500+",
    label: "Stores",
  },
  {
    icon: (
      <svg
        className="h-6 w-6 text-bfw-red"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    value: "7",
    label: "Areas",
  },
  {
    icon: (
      <svg
        className="h-6 w-6 text-bfw-red"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    value: "1M+",
    label: "Monthly Visitors",
  },
];

export function MallStatsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev >= STATS.length - 1 ? 0 : prev + 1));
      }, 2500);
    };

    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!containerRef.current || !isMobile) return;
    const scrollAmount = currentSlide * containerRef.current.offsetWidth;
    containerRef.current.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, [currentSlide, isMobile]);

  const handleTouchStart = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    autoScrollRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev >= STATS.length - 1 ? 0 : prev + 1));
    }, 2500);
  };

  return (
    <div className="py-4">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex gap-4 px-4 max-w-5xl mx-auto md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className="flex-shrink-0 w-full md:w-auto snap-center bg-white rounded-2xl p-6 text-center shadow-sm"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-red-50 rounded-full flex items-center justify-center">
              {stat.icon}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mobile dots indicator */}
      {isMobile && (
        <div className="flex justify-center gap-2 mt-4">
          {STATS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-bfw-red" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
