interface Props {
  openingHours: string;
}

export function OpeningHoursCard({ openingHours }: Props) {
  if (!openingHours) return null;

  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getSingaporeNow = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Singapore" }));
  };

  const extractScheduleText = (text: string) => {
    const weeklyMatch = text.match(/weekly schedule:\s*([\s\S]+)/i);
    if (weeklyMatch?.[1]) return weeklyMatch[1].trim();
    return text.replace(/^opening hours:\s*/i, "").trim();
  };

  const fillRange = (entries: Record<string, string>, startIndex: number, endIndex: number, value: string) => {
    if (startIndex === -1 || endIndex === -1) return;
    if (endIndex < startIndex) {
      for (let i = startIndex; i < dayOrder.length; i += 1) {
        entries[dayOrder[i]] = value;
      }
      for (let i = 0; i <= endIndex; i += 1) {
        entries[dayOrder[i]] = value;
      }
      return;
    }
    for (let i = startIndex; i <= endIndex; i += 1) {
      entries[dayOrder[i]] = value;
    }
  };

  const parseSchedule = (text: string) => {
    const entries: Record<string, string> = {};
    const clauses = extractScheduleText(text)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const clause of clauses) {
      const match = clause.match(
        /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)(?:\s*(?:-|to)\s*(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday))?\s*:?\s*(.+)$/i,
      );
      if (!match) continue;

      const startIndex = dayOrder.findIndex((day) => day.toLowerCase() === match[1].toLowerCase());
      const endIndex = match[2]
        ? dayOrder.findIndex((day) => day.toLowerCase() === match[2].toLowerCase())
        : startIndex;
      const value = match[3].trim();
      fillRange(entries, startIndex, endIndex, value);
    }

    return entries;
  };

  const parseTime = (value: string) => {
    const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (!match) return null;
    const hourRaw = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    const period = match[3].toLowerCase();
    if (!Number.isFinite(hourRaw) || !Number.isFinite(minutes)) return null;
    let hour = hourRaw % 12;
    if (period === "pm") hour += 12;
    return hour * 60 + minutes;
  };

  const parseOpenClose = (value: string) => {
    const parts = value.replace(/\u2013/g, "-").split("-");
    if (parts.length < 2) return null;
    const open = parseTime(parts[0]);
    const close = parseTime(parts[1]);
    if (open === null || close === null) return null;
    return { open, close, openLabel: parts[0].trim() };
  };

  const scheduleSource = extractScheduleText(openingHours);
  const normalizedSchedule = scheduleSource
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const schedule = parseSchedule(openingHours);
  if (Object.keys(schedule).length === 0) {
    const rangeMatch = normalizedSchedule.match(
      /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s*(?:-|to)\s*(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i,
    );
    const timeRangeMatch = normalizedSchedule.match(
      /(\d{1,2}(?::\d{2})?\s*(am|pm))\s*-\s*(\d{1,2}(?::\d{2})?\s*(am|pm))/i,
    );

    if (rangeMatch && timeRangeMatch) {
      const startIndex = dayOrder.findIndex((day) => day.toLowerCase() === rangeMatch[1].toLowerCase());
      const endIndex = dayOrder.findIndex((day) => day.toLowerCase() === rangeMatch[2].toLowerCase());
      const value = `${timeRangeMatch[1].trim()} - ${timeRangeMatch[3].trim()}`;
      fillRange(schedule, startIndex, endIndex, value);
    } else if (timeRangeMatch) {
      for (const day of dayOrder) {
        schedule[day] = `${timeRangeMatch[1].trim()} - ${timeRangeMatch[3].trim()}`;
      }
    } else if (normalizedSchedule.match(/\d{1,2}(?::\d{2})?\s*(am|pm)/i)) {
      for (const day of dayOrder) {
        schedule[day] = normalizedSchedule.trim();
      }
    }
  }
  const hasSchedule = Object.keys(schedule).length > 0;
  const singaporeNow = getSingaporeNow();
  const todayIndex = singaporeNow.getDay();
  const todayLabel = dayOrder[todayIndex];
  const todaysHours = hasSchedule ? schedule[todayLabel] : openingHours;
  const openClose = todaysHours ? parseOpenClose(todaysHours) : null;
  const nowMinutes = singaporeNow.getHours() * 60 + singaporeNow.getMinutes();
  const isOpen = openClose ? nowMinutes >= openClose.open && nowMinutes < openClose.close : /open/i.test(normalizedSchedule);
  const openStatus = isOpen ? "open" : "closed";
  const openTimeLabel = openClose?.openLabel ?? "";

  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#e74c3c]" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        Opening Hours
      </div>
      <div className="mt-4 h-px w-full bg-gray-100" />
      <div className="mt-4 space-y-2 text-sm">
        {hasSchedule ? (
          dayOrder.map((day) => (
            <div
              key={day}
              className={`flex items-center justify-between rounded-lg px-3 py-3 ${
                day === todayLabel ? "bg-[#fff1f1] font-semibold text-gray-900" : "text-gray-700"
              }`}
            >
              <span>{day}</span>
              <span className={day === todayLabel ? "text-gray-900" : "text-gray-800"}>
                {schedule[day] ?? "--"}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700">{openingHours}</div>
        )}
      </div>
      <div
        className={`mt-5 rounded-xl px-4 py-4 text-center text-sm font-semibold ${
          openStatus === "open" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}
      >
        {openStatus === "open"
          ? "We are currently open and serving customers!"
          : `Sorry, we are currently closed. ${openTimeLabel ? `Opens at ${openTimeLabel}.` : "Please check back during our operating hours."}`}
      </div>
    </section>
  );
}
