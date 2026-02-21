/**
 * Parse opening hours from various formats into a structured day-by-day schedule.
 * Handles: JSON array strings, "Day: Time" lines, plain text, etc.
 */

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DaySchedule = { day: string; hours: string }[];

export function parseOpeningHoursText(raw: string): DaySchedule | null {
  if (!raw || !raw.trim()) return null;

  let lines: string[] = [];

  // Try JSON array parse first (Google Places format)
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        lines = parsed.map(String);
      }
    } catch {
      // Not valid JSON, fall through
    }
  }

  // If not JSON, split by newlines, semicolons, or commas (but not commas inside times)
  if (lines.length === 0) {
    // Remove common prefixes
    const cleaned = raw
      .replace(/^(Opening Hours|Weekly Schedule|Hours)\s*:?\s*/i, "")
      .trim();
    lines = cleaned
      .split(/[\n;]+|,\s*(?=[A-Z][a-z])/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Try to parse "Day: Hours" format
  const schedule: DaySchedule = [];
  for (const line of lines) {
    // Match patterns like "Monday: 10:00 AM – 9:30 PM" or "Mon - Fri: 10am-9pm"
    const match = line.match(
      /^([A-Za-z]+(?:\s*[-–to]+\s*[A-Za-z]+)?)\s*:\s*(.+)$/,
    );
    if (match) {
      const dayPart = match[1].trim();
      const hours = match[2].trim();

      // Expand day ranges
      const expandedDays = expandDayRange(dayPart);
      for (const day of expandedDays) {
        schedule.push({ day, hours });
      }
    }
  }

  if (schedule.length > 0) {
    // Sort by day order
    return sortByDayOrder(schedule);
  }

  // If no structured format was found, try line-by-line display
  if (lines.length > 1) {
    return lines.map((line) => ({ day: "", hours: line }));
  }

  return null;
}

function expandDayRange(dayPart: string): string[] {
  // Normalize day names
  const dayMap: Record<string, string> = {
    mon: "Monday",
    tue: "Tuesday",
    tues: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const rangeMatch = dayPart.match(/^([A-Za-z]+)\s*[-–to]+\s*([A-Za-z]+)$/i);
  if (rangeMatch) {
    const startDay = dayMap[rangeMatch[1].toLowerCase()] || rangeMatch[1];
    const endDay = dayMap[rangeMatch[2].toLowerCase()] || rangeMatch[2];
    const startIdx = DAY_ORDER.indexOf(startDay as any);
    const endIdx = DAY_ORDER.indexOf(endDay as any);
    if (startIdx !== -1 && endIdx !== -1) {
      const days: string[] = [];
      for (let i = startIdx; i !== (endIdx + 1) % 7; i = (i + 1) % 7) {
        days.push(DAY_ORDER[i]);
        if (days.length > 7) break; // safety
      }
      days.push(DAY_ORDER[endIdx]);
      // Deduplicate
      return [...new Set(days)];
    }
  }

  const single = dayMap[dayPart.toLowerCase()];
  return single ? [single] : [dayPart];
}

function sortByDayOrder(schedule: DaySchedule): DaySchedule {
  return schedule.sort((a, b) => {
    const aIdx = DAY_ORDER.indexOf(a.day as any);
    const bIdx = DAY_ORDER.indexOf(b.day as any);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
}

/**
 * Check if all entries have the same hours — if so, show "Daily" instead.
 */
export function getCondensedSchedule(schedule: DaySchedule): DaySchedule {
  if (schedule.length === 0) return schedule;
  const uniqueHours = new Set(schedule.map((s) => s.hours));
  if (uniqueHours.size === 1 && schedule.length >= 5) {
    return [{ day: "Daily", hours: schedule[0].hours }];
  }
  return schedule;
}

/**
 * Get today's hours from parsed schedule.
 */
export function getTodayHours(schedule: DaySchedule): string | null {
  const sgDay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Singapore",
  }).format(new Date());
  const entry = schedule.find((s) => s.day === sgDay);
  return entry?.hours ?? null;
}
