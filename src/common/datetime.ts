// Replica of https://github.com/Notarise-gov-sg/healthcert-renderer/blob/352bc3ce4e24308942dce295b604a13daa394b0e/src/util/datetime.ts

const SG_LOCALE = "en-sg";

// FIXME: "en-sg" locale may not be supported in user's browser

/**
 * Returns a nicely formatted date-time string using "en-sg" locale.
 * @param iso "2020-09-28T06:15:00Z"
 * @returns "28 September 2020, 2:15 pm SGT"
 */
export const isoToLocaleString = (iso = ""): string =>
  new Date(iso).toLocaleString(SG_LOCALE, {
    timeZoneName: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

/**
 * Returns a nicely formatted date-only string that is not affected by time.
 * Good for birth dates.
 * @param iso "2020-09-28T06:15:00Z"
 * @returns "28 September 2020"
 */
export const isoToDateOnlyString = (iso = ""): string =>
  // Remove time if present
  new Date(iso.split("T")[0]).toLocaleString(SG_LOCALE, {
    /**
     * Should not respect provided timezone. Instead, should force "UTC" timezone
     * because this generated date object is always going to be ...T00:00:00.000Z
     * Explanation: https://github.com/Notarise-gov-sg/healthcert-renderer/pull/52
     * */
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
