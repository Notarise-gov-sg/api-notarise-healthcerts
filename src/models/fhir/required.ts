import validate from "validate.js";
import { DocumentInvalidError } from "../../common/error";
import { ParsedBundle } from "./types";
import { getConstraints, Type } from "./constraints";

export const hasRequiredFields = (type: Type, parsedBundle: ParsedBundle) => {
  const constraints = getConstraints(type, parsedBundle.observations.length);

  const errors = validate(parsedBundle, constraints, {
    fullMessages: false,
    format: "flat",
  });

  if (errors) {
    throw new DocumentInvalidError(
      `the following required fields in fhirBundle are missing: ${JSON.stringify(
        errors
      )}. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38`
    );
  }
};
