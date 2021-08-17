import validate from "validate.js";
import { Bundle } from "./types";

const commonConstraints = {
  "patient.fullName": { presence: true },
  "patient.birthDate": { presence: true },
  "patient.nationality.code": { presence: true },
  "patient.passportNumber": { presence: true },

  "specimen.swabType.code": { presence: true },
  "specimen.collectionDateTime": { presence: true },

  // TODO: Finish up the rest of the constraints
};

const artConstraints = {
  // TODO: Finish up the rest of the constraints
  // Fields only ART HealthCerts should have
};

const pcrConstraints = {
  // TODO: Finish up the rest of the constraints
  // Fields only PCR HealthCerts should have
};

export const hasRequiredFields = (type: "ART" | "PCR", bundle: Bundle) => {
  let constraints;

  switch (type) {
    case "ART":
      constraints = { ...commonConstraints, ...artConstraints };
      break;

    case "PCR":
      constraints = { ...commonConstraints, ...pcrConstraints };
      break;

    default:
      throw new Error(
        `Unable to check for required fields of unknown type: ${type}`
      );
  }

  const errors = validate(bundle, constraints);
  if (errors) {
    throw new Error(JSON.stringify(errors));
  }
};
