import { todayLocal, toLocalDateString } from './date.utils';

describe('todayLocal', () => {
  it('returns the local calendar date as YYYY-MM-DD', () => {
    expect(todayLocal(new Date(2026, 0, 8, 12, 0))).toBe('2026-01-08');
  });

  it('does not roll over to the next UTC day late at night', () => {
    // In a western timezone this instant is already the next UTC day, so a
    // toISOString-based implementation returns 2026-01-09.
    const lateEvening = new Date(2026, 0, 8, 23, 59, 59);
    expect(todayLocal(lateEvening)).toBe('2026-01-08');
    expect(lateEvening.toISOString().slice(0, 10)).not.toBe('2026-01-08');
  });

  it('does not roll over in the minutes after local midnight', () => {
    expect(todayLocal(new Date(2026, 0, 8, 0, 0, 1))).toBe('2026-01-08');
  });

  it('agrees with toLocalDateString for the same instant', () => {
    const now = new Date(2026, 5, 15, 18, 45);
    expect(todayLocal(now)).toBe(toLocalDateString(now));
  });
});
