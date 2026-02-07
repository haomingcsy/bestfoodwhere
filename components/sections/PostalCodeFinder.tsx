"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconPin } from "@/components/layout/icons";

interface MallResult {
  name: string;
  slug: string;
  area: string;
}

type TravelMode = "Driving" | "Transit" | "Walking" | "Cycling" | "Motorbike";

interface TravelTime {
  mode: TravelMode;
  minutes: number;
}

function isValidPostalCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

function clampMinutes(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveTimesFromPostalCode(postalCode: string): TravelTime[] {
  const seed = Number.parseInt(postalCode, 10);
  const base = (seed % 17) + 8; // 8..24

  const driving = clampMinutes(base, 6, 35);
  const transit = clampMinutes(driving + 8 + (seed % 7), 12, 55);
  const walking = clampMinutes(driving * 4 + (seed % 9), 18, 120);
  const cycling = clampMinutes(Math.round(walking / 3), 10, 60);
  const motorbike = clampMinutes(Math.round(driving * 0.9), 6, 30);

  return [
    { mode: "Driving", minutes: driving },
    { mode: "Transit", minutes: transit },
    { mode: "Walking", minutes: walking },
    { mode: "Cycling", minutes: cycling },
    { mode: "Motorbike", minutes: motorbike },
  ];
}

function findNearestMallMock(postalCode: string): MallResult {
  const sector = Number.parseInt(postalCode.slice(0, 2), 10);

  if (sector <= 8) {
    return { name: "Suntec City", slug: "suntec-city", area: "Marina Bay" };
  }
  if (sector <= 13) {
    return { name: "VivoCity", slug: "vivocity", area: "HarbourFront" };
  }
  if (sector <= 20) {
    return { name: "Plaza Singapura", slug: "plaza-singapura", area: "Orchard" };
  }
  if (sector <= 28) {
    return { name: "Junction 8", slug: "junction-8", area: "Bishan" };
  }
  if (sector <= 36) {
    return { name: "NEX", slug: "nex", area: "Serangoon" };
  }
  if (sector <= 45) {
    return { name: "Tampines Mall", slug: "tampines-mall", area: "Tampines" };
  }
  if (sector <= 52) {
    return { name: "Jewel Changi", slug: "jewel", area: "Changi Airport" };
  }
  if (sector <= 60) {
    return { name: "Velocity Novena Square", slug: "velocity-novena-square", area: "Novena" };
  }
  if (sector <= 69) {
    return { name: "United Square", slug: "united-square", area: "Thomson" };
  }
  if (sector <= 80) {
    return { name: "Marina Bay Sands", slug: "marina-bay-sands", area: "Bayfront" };
  }
  return { name: "IMM", slug: "imm", area: "Jurong East" };
}

export function PostalCodeFinder() {
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    mall: MallResult;
    times: TravelTime[];
  } | null>(null);

  const suggested = useMemo(
    () => [
      { code: "238839", area: "Orchard" },
      { code: "018956", area: "Marina Bay" },
    ],
    []
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isValidPostalCode(postalCode)) {
      setResult(null);
      setStatus("idle");
      setError("Please enter a valid 6-digit Singapore postal code.");
      return;
    }

    setStatus("loading");
    setResult(null);

    await new Promise((r) => setTimeout(r, 650));
    const mall = findNearestMallMock(postalCode);
    const times = deriveTimesFromPostalCode(postalCode);
    setResult({ mall, times });
    setStatus("ready");
  };

  return (
    <section className="w-full bg-[#fff9f6] py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="text-center">
          <h2 className="font-heading text-[34px] leading-tight font-bold text-bfw-orange md:text-[48px]">
            Find Delicious Food Near You
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] font-body text-[15px] leading-relaxed text-[#666666] md:text-[16px]">
            Enter your postal code to discover amazing restaurants and food options <br className="hidden md:block" />
            in your area
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-[600px]">
          <form
            onSubmit={onSubmit}
            className="flex overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <input
              inputMode="numeric"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(e) =>
                setPostalCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
              }
              placeholder="Enter your 6-digit postal code"
              aria-label="Postal code"
              className="h-14 w-full flex-1 border border-transparent bg-white px-6 font-body text-[15px] text-black outline-none placeholder:text-[#999] focus:border-bfw-orange focus:ring-4 focus:ring-bfw-orange/15"
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-14 w-[170px] items-center justify-center bg-bfw-orange font-heading text-[14px] font-bold tracking-wide text-white transition-colors hover:bg-bfw-orange-hover disabled:opacity-60"
            >
              {status === "loading" ? "FINDING..." : "FIND FOOD"}
            </button>
          </form>

          <div className="mt-3 text-center font-body text-[13px] text-[#666666]">
            Try postal codes:{" "}
            <button
              type="button"
              onClick={() => setPostalCode(suggested[0].code)}
              className="font-semibold text-bfw-orange underline underline-offset-2"
            >
              {suggested[0].code}
            </button>{" "}
            ({suggested[0].area}) or{" "}
            <button
              type="button"
              onClick={() => setPostalCode(suggested[1].code)}
              className="font-semibold text-bfw-orange underline underline-offset-2"
            >
              {suggested[1].code}
            </button>{" "}
            ({suggested[1].area})
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-[980px] grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <h3 className="font-heading text-[18px] font-bold text-bfw-orange">
              Find Local Restaurants
            </h3>
            <p className="mt-3 font-body text-[14px] leading-relaxed text-[#666666]">
              Discover the best food options near any postal code in seconds.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <h3 className="font-heading text-[18px] font-bold text-bfw-orange">
              Check Travel Times
            </h3>
            <p className="mt-3 font-body text-[14px] leading-relaxed text-[#666666]">
              See how long it takes to get there by car, walking, or public transit.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <h3 className="font-heading text-[18px] font-bold text-bfw-orange">
              Browse Menus
            </h3>
            <p className="mt-3 font-body text-[14px] leading-relaxed text-[#666666]">
              View restaurant menus and get directions with just one click.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mx-auto mt-8 max-w-[760px]">
            <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : null}

        {result ? (
          <div className="mx-auto mt-8 max-w-[760px] rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:p-7">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-bfw-orange/10 text-bfw-orange">
                  <IconPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-gray-700">
                    Nearest mall
                  </p>
                  <p className="font-heading text-xl font-bold text-black">
                    {result.mall.name}
                  </p>
                  <p className="font-body text-sm text-[#666]">
                    {result.mall.area}, Singapore
                  </p>
                </div>
              </div>

              <Link
                href={`/shopping-malls/${result.mall.slug}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-5 font-heading text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                View Directory →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {result.times.map((t) => (
                <div
                  key={t.mode}
                  className="rounded-xl bg-[#f7f7f7] px-4 py-3 text-center"
                >
                  <p className="font-body text-xs text-[#666]">{t.mode}</p>
                  <p className="font-heading text-lg font-bold text-black">
                    {t.minutes} min
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 font-body text-xs text-[#777]">
              Travel times are mock values for now (Google Maps integration will be added later).
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
