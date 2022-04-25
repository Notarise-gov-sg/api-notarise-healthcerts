import validate from "validate.js";
import { CodedError } from "../../common/error";
import { ParsedBundle } from "./types";
import {
  getRecognisedConstraints,
  customNricFinValidation,
  Type,
} from "./constraints";

export const hasRecognisedFields = (type: Type, parsedBundle: ParsedBundle) => {
  const constraints = getRecognisedConstraints(
    type,
    parsedBundle.observations.length
  );

  validate.validators.nricFin = customNricFinValidation;

  const errors = validate(parsedBundle, constraints, {
    fullMessages: false,
    format: "flat",
  });

  if (errors) {
    throw new CodedError(
      "INVALID_DOCUMENT",
      `Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: ${JSON.stringify(
        errors
      )}. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`
    );
  }
};
