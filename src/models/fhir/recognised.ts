import validate from "validate.js";
import { isNRICValid } from "@notarise-gov-sg/sns-notify-recipients/dist/services/validateNRIC";
import { CodedError } from "../../common/error";
import { ParsedBundle } from "./types";
import { getRecognisedConstraints, Type } from "./constraints";

export const hasRecognisedFields = (type: Type, parsedBundle: ParsedBundle) => {
  const constraints = getRecognisedConstraints(
    type,
    parsedBundle.observations.length
  );

  const errors = validate(parsedBundle, constraints, {
    fullMessages: false,
    format: "flat",
  });

  if (errors) {
    throw new CodedError(
      "INVALID_DOCUMENT",
      `Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: ${JSON.stringify(
        errors
      )}. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`
    );
  }

  if (!isNRICValid(parsedBundle.patient.nricFin)) {
    throw new CodedError(
      "INVALID_DOCUMENT",
      `Submitted HealthCert is invalid, the patient NRIC-FIN value in fhirBundle has invalid checksum. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`
    );
  }
};
