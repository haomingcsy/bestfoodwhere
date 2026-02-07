import type { ShoppingMall, OpeningHoursEntry } from "@/types/shopping-mall";

interface Props {
  mall: ShoppingMall;
}

function getOpenStatus(hours: OpeningHoursEntry[]): {
  isOpen: boolean;
  statusText: string;
  closesAt?: string;
} {
  const now = new Date();
  const singaporeTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Singapore" }),
  );
  const currentDay = singaporeTime.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const currentMinutes =
    singaporeTime.getHours() * 60 + singaporeTime.getMinutes();

  const todayHours = hours.find((h) => h.day === currentDay);

  if (!todayHours || !todayHours.hours) {
    return { isOpen: false, statusText: "Hours not available" };
  }

  if (/closed/i.test(todayHours.hours)) {
    return { isOpen: false, statusText: "Closed Today" };
  }

  // Parse time range like "10:00 AM - 10:00 PM"
  const timeMatch = todayHours.hours.match(
    /(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i,
  );

  if (!timeMatch) {
    return { isOpen: true, statusText: todayHours.hours };
  }

  const openHour =
    (parseInt(timeMatch[1]) % 12) +
    (timeMatch[3].toUpperCase() === "PM" ? 12 : 0);
  const openMin = parseInt(timeMatch[2] || "0");
  const closeHour =
    (parseInt(timeMatch[4]) % 12) +
    (timeMatch[6].toUpperCase() === "PM" ? 12 : 0);
  const closeMin = parseInt(timeMatch[5] || "0");

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    const remainingMinutes = closeMinutes - currentMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;

    let timeText = "";
    if (remainingHours > 0) {
      timeText = `${remainingHours}h ${remainingMins}m`;
    } else {
      timeText = `${remainingMins}m`;
    }

    return {
      isOpen: true,
      statusText: `Open Now (Closes in ${timeText})`,
      closesAt: `${timeMatch[4]}:${timeMatch[5] || "00"} ${timeMatch[6]}`,
    };
  }

  return {
    isOpen: false,
    statusText: `Closed (Opens at ${timeMatch[1]}:${timeMatch[2] || "00"} ${timeMatch[3]})`,
  };
}

export function MallOpeningHoursCard({ mall }: Props) {
  if (mall.openingHours.length === 0) return null;

  const { isOpen, statusText } = getOpenStatus(mall.openingHours);

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <h3 className="text-lg font-semibold text-gray-900">Opening Hours</h3>

      {/* Status Badge */}
      <div
        className={`mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
          isOpen ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}
      >
        {statusText}
      </div>

      {/* Hours List */}
      <div className="mt-4 space-y-2">
        {mall.openingHours.map((entry) => (
          <div
            key={entry.day}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
              entry.isToday
                ? "bg-bfw-orange/5 font-semibold text-gray-900"
                : "text-gray-600"
            }`}
          >
            <span>{entry.day}</span>
            <span>{entry.hours || "Closed"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
