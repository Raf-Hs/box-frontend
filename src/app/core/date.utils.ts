/** Shared local-calendar date helpers.

 * Dates are represented as `YYYY-MM-DD` strings. All arithmetic is done on
 * local calendar components so that a timezone offset never shifts the day.
 * Never use `Date.prototype.toISOString()` here: it converts to UTC and can
 * return the previous or next calendar day.
 */

/** Formats a Date as `YYYY-MM-DD` using its local calendar date. */
export function toLocalDateString(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an inclusive `{ from, to }` pair ending on the local calendar day of
 * `now` and spanning exactly `days` calendar days.
 *
 * The range is inclusive on both ends, so `days: 7` covers today and the six
 * days before it, not eight days.
 */
export function inclusiveRangeEndingToday(
  days: number,
  now: Date = new Date()
): { from: string; to: string } {
  if (days < 1) {
    throw new Error('Range must cover at least one day.');
  }

  // Constructing via local components avoids DST and month-boundary drift.
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));

  return {
    from: toLocalDateString(from),
    to: toLocalDateString(now),
  };
}

/**
 * Returns today's local calendar date as `YYYY-MM-DD`.
 *
 * Prefer this over `new Date().toISOString()`, which converts to UTC and can
 * return the wrong calendar day for users in western timezones.
 */
export function todayLocal(now: Date = new Date()): string {
  return toLocalDateString(now);
}

/**
 * Returns true when `from` is on or before `to`. Both values must be
 * `YYYY-MM-DD` strings, for which lexicographic order matches date order.
 */
export function isValidRange(from: string, to: string): boolean {
  return from <= to;
}
