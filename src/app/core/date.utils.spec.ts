import {
  inclusiveRangeEndingToday,
  isValidRange,
  toLocalDateString,
} from './date.utils';

describe('date.utils', () => {
  describe('toLocalDateString', () => {
    it('formats a local date as YYYY-MM-DD with zero padding', () => {
      expect(toLocalDateString(new Date(2026, 0, 5, 13, 0))).toBe('2026-01-05');
      expect(toLocalDateString(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30');
      expect(toLocalDateString(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
    });

    it('keeps the local calendar day late at night, unaffected by UTC offset', () => {
      // A UTC-based implementation would return the following day here.
      const lateEvening = new Date(2026, 0, 8, 23, 59, 59);
      expect(toLocalDateString(lateEvening)).toBe('2026-01-08');
    });

    it('keeps the local calendar day just after midnight', () => {
      expect(toLocalDateString(new Date(2026, 0, 8, 0, 0, 1))).toBe('2026-01-08');
    });
  });

  describe('inclusiveRangeEndingToday', () => {
    it('spans today and the six preceding days for a 7-day range', () => {
      const { from, to } = inclusiveRangeEndingToday(7, new Date(2026, 0, 8, 13, 45));

      expect(from).toBe('2026-01-02');
      expect(to).toBe('2026-01-08');
    });

    it('uses the correct inclusive boundaries for a 30-day range', () => {
      const { from, to } = inclusiveRangeEndingToday(30, new Date(2026, 0, 31, 9, 0));

      expect(from).toBe('2026-01-02');
      expect(to).toBe('2026-01-31');
    });

    it('uses the correct inclusive boundaries for a 90-day range', () => {
      const { from, to } = inclusiveRangeEndingToday(90, new Date(2026, 2, 31, 12, 0));

      expect(from).toBe('2026-01-01');
      expect(to).toBe('2026-03-31');
    });

    it('returns a single day when days is 1', () => {
      const { from, to } = inclusiveRangeEndingToday(1, new Date(2026, 0, 8, 12, 0));

      expect(from).toBe('2026-01-08');
      expect(to).toBe('2026-01-08');
    });

    it('crosses month and year boundaries correctly', () => {
      expect(inclusiveRangeEndingToday(7, new Date(2026, 0, 3, 15, 0))).toEqual({
        from: '2025-12-28',
        to: '2026-01-03',
      });
    });

    it('spans a DST transition without shifting calendar days', () => {
      // Northern-hemisphere clocks move forward in March; the local calendar
      // day must not drift because of the missing hour.
      const { from, to } = inclusiveRangeEndingToday(7, new Date(2026, 2, 10, 12, 0));

      expect(from).toBe('2026-03-04');
      expect(to).toBe('2026-03-10');
    });

    it('produces exactly the requested number of calendar days', () => {
      const days = 90;
      const { from, to } = inclusiveRangeEndingToday(days, new Date(2026, 5, 15, 18, 30));

      const start = parseLocal(from);
      const end = parseLocal(to);
      const calendarDays =
        Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

      expect(calendarDays).toBe(days);
    });

    it('rejects a range shorter than one day', () => {
      expect(() => inclusiveRangeEndingToday(0)).toThrow();
      expect(() => inclusiveRangeEndingToday(-5)).toThrow();
    });
  });

  describe('isValidRange', () => {
    it('accepts From on or before To', () => {
      expect(isValidRange('2026-01-01', '2026-01-31')).toBeTrue();
      expect(isValidRange('2026-01-01', '2026-01-01')).toBeTrue();
    });

    it('rejects From after To', () => {
      expect(isValidRange('2026-01-31', '2026-01-01')).toBeFalse();
    });

    it('compares ISO strings correctly across months and years', () => {
      expect(isValidRange('2025-12-28', '2026-01-03')).toBeTrue();
      expect(isValidRange('2026-01-01', '2025-12-31')).toBeFalse();
    });
  });
});

/** Parses a YYYY-MM-DD string as a local-midnight Date. */
function parseLocal(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}
