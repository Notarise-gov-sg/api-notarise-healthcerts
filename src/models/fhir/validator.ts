import { isNRICValid } from "@notarise-gov-sg/sns-notify-recipients/dist/services/validateNRIC";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.locale("en-sg");
dayjs.extend(utc);
dayjs.extend(customParseFormat);

/**
 * Introduce custom NRIC-FIN validator
 * Used by getRecognisedConstraints() in "src/models/fhir/constraints.ts"
 */
export const customNricFinValidation = (
  value: unknown,
  options: { allowEmpty: boolean }
) => {
  if (options.allowEmpty && !value) {
    return null; // Pass
  }

  const friendlyKey = `Patient.identifier[1].{ id=NRIC-FIN, value }`;
  if (typeof value !== "string")
    return `'${friendlyKey}' value should be a valid string type`;
  else if (!isNRICValid(value))
    return `'${friendlyKey}' value has an invalid NRIC-FIN checksum`;
  else return null; // Pass
};

/**
 * Introduce custom birthDate validator
 * Used by getRecognisedConstraints() in "src/models/fhir/constraints.ts"
 */
export const customBirthDateValidation = (
  value: unknown,
  options: { allowEmpty: boolean }
) => {
  if (options.allowEmpty && !value) {
    return null; // Pass
  }
  const dateValue = (value as string).split("T")[0]; // take only date value if ISO-8601 format
  const friendlyKey = `Patient.birthDate`;
  if (dateValue && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(dateValue) === false)
    return `'${friendlyKey}' value is invalid. Use YYYY-MM-DD or YYYY-MM or YYYY or ISO-8601 format`;
  else return null; // Pass
};

/**
 * Introduce custom isoDateTime validator
 * Used by getRecognisedConstraints() in "src/models/fhir/constraints.ts"
 */
export const customIsoDateTimeValidation = (
  value: unknown,
  options: { friendlyKey: "Date Time" }
) => {
  const dateValue = (value as string).split("T")[0]; // take only date value if ISO-8601 format
  if (dateValue && !dayjs(dateValue, ["YYYY-MM-DD"], true).isValid())
    return `'${options.friendlyKey}' value is invalid. Use YYYY-MM-DD or ISO-8601 format`;
  else return null; // Pass
};
