import validate from "validate.js";
import { DocumentInvalidError } from "../../common/error";
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
    throw new DocumentInvalidError(
      `the following fields in fhirBundle are not recognised: ${JSON.stringify(
        errors
      )}. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38`
    );
  }
};