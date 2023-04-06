// Replica of https://github.com/Notarise-gov-sg/healthcert-renderer/blob/352bc3ce4e24308942dce295b604a13daa394b0e/src/util/datetime.ts

import moment from "moment-timezone";

const SG_LOCALE = "en-sg";
const ZEROES = "00";

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

/**
 * Returns a nicely formatted date-time string with GMT+08:00 timezone.
 * @param iso "2020-09-28T06:15:00Z"
 * @returns "9/28/20 6:15:00 AM GMT+08:00"
 */
export const parseDateTime = (dateString: string | undefined): string =>
  dateString
    ? `${moment
        .tz(dateString, "Asia/Singapore")
        .format("M/D/YY h:mm:ss A")} GMT+08:00`
    : "";

/**
 * Returns a date string ignoring fields with only zeroes
 * @param "2020-00-00 or 2020-02-00"
 * @returns "2020 or 2020-20"
 */
export const parseDateWithoutZeroes = (dateString: string): string => {
  // To parse Vault dob which is always in YYYY-MM-DD format
  const dayIsZero =
    dateString.split("-")[2] === ZEROES ||
    dateString.split("-")[2] === undefined;
  const monthIsZero =
    dateString.split("-")[1] === ZEROES ||
    dateString.split("-")[1] === undefined;
  let result = dateString;

  if (dayIsZero && monthIsZero) {
    result = result?.slice(0, 4);
  } else if (dayIsZero) {
    result = result?.slice(0, 7);
  }
  return result;
};
