const STORE_TIME_ZONE = 'Asia/Jakarta';
const WIB_OFFSET_MINUTES = 7 * 60;

export const OPENING_HOUR = 7;
export const CLOSING_HOUR = 20;

export const STORE_CLOSED_MESSAGE =
  `Pembayaran QRIS hanya tersedia pukul 07.00–${CLOSING_HOUR}.00 WIB. Silakan kembali saat jam operasional.`;

const wibClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: STORE_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * Reads the wall-clock hour and minute in WIB for an instant. Deriving the
 * value through Intl keeps the rule correct for visitors whose device is not
 * set to WIB, and avoids the DST/offset mistakes of a fixed numeric shift.
 */
export function getWibTime(date = new Date()) {
  const parts = wibClock.formatToParts(date);
  const read = (type) => Number(parts.find((part) => part.type === type)?.value);
  return { hour: read('hour') % 24, minute: read('minute') };
}

/**
 * QRIS is available from 07:00 WIB inclusive until 20:00 WIB exclusive.
 * Returns the minutes-of-day form so callers can reason about the boundary.
 */
export function isQrisOpen(date = new Date()) {
  const { hour, minute } = getWibTime(date);
  const minutesOfDay = hour * 60 + minute;
  return minutesOfDay >= OPENING_HOUR * 60 && minutesOfDay < CLOSING_HOUR * 60;
}

/**
 * Guards a QRIS action. Throws with a customer-facing message when the store
 * is closed so every entry point shares one wording and one boundary rule.
 * Kept free of browser APIs so a future backend can call it unchanged.
 */
export function assertQrisOpen(date = new Date()) {
  if (!isQrisOpen(date)) {
    throw new Error(STORE_CLOSED_MESSAGE);
  }
}

/**
 * Builds an instant at a given WIB wall-clock time on the UTC day of `date`.
 * Exported for tests, which need to pin exact boundary moments.
 */
export function wibTimeToUtcDate(hour, minute, date = new Date()) {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return new Date(utcMidnight + (hour * 60 + minute - WIB_OFFSET_MINUTES) * 60 * 1000);
}
