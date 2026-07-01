/** Shared formatting + period helpers for the admin dashboard. */

/** Current period as "YYYY-MM" (the unit payments are tracked in). */
export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Shift a "YYYY-MM" period by N months (negative = past). */
export function shiftPeriod(period: string, months: number): string {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return currentPeriod(d);
}

/** Build a list of the last N periods, newest first, including the current one. */
export function recentPeriods(count = 12, from = currentPeriod()): string[] {
  return Array.from({ length: count }, (_, i) => shiftPeriod(from, -i));
}

/** Human label for a period, e.g. "junio 2026" in the given locale. */
export function formatPeriod(period: string, locale = "es"): string {
  const [y, m] = (period ?? "").split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  // Never throw on malformed input — a bad value must not crash a render.
  if (Number.isNaN(d.getTime())) return period ?? "—";
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Currency in euros for the given locale. */
export function formatEuros(amount: number | null, locale = "es"): string {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// The academy is in Spain, and pages are server-rendered (the server runs in
// UTC), so times must be pinned to Spain's timezone or they'd print 2h early.
const APP_TIME_ZONE = "Europe/Madrid";

/** Short date, e.g. "12 jun 2026". Returns "—" for missing/invalid dates. */
export function formatDate(iso: string | null, locale = "es"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(d);
}

/** Date + time, e.g. "12 jul 2026, 11:00" — used for seminars + competitions. */
export function formatDateTime(iso: string | null, locale = "es"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(d);
}
