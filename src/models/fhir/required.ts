import validate from "validate.js";
import { CodedError } from "../../common/error";
import { ParsedBundle } from "./types";
import { getRequiredConstraints, Type } from "./constraints";

export const hasRequiredFields = (type: Type, parsedBundle: ParsedBundle) => {
  const constraints = getRequiredConstraints(type);

  const errors = validate(parsedBundle, constraints, {
    fullMessages: false,
    format: "flat",
  });

  if (errors) {
    throw new CodedError(
      "INVALID_DOCUMENT",
      `Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: ${JSON.stringify(
        errors
      )}. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`
    );
  }
};
