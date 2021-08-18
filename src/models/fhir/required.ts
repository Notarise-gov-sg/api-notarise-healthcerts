import validate from "validate.js";
import { Bundle } from "./types";

const getCommonConstraints = (observationCount: number) => {
  const commonConstraints: any = {
    /* object validation constraints at here */

    // patient validation constraints
    "patient.fullName": { presence: true },
    "patient.birthDate": { presence: true },
    "patient.nationality.code": { presence: true },
    "patient.passportNumber": { presence: true },
    // specimen validation constraints
    "specimen.swabType.code": { presence: true },
    "specimen.swabType.display": { presence: true },
    "specimen.collectionDateTime": { presence: true },

    // organization `moh` validation constraints
    "organization.moh.fullName": { presence: true },
    "organization.moh.type": { presence: true },
    "organization.moh.url": { presence: true },
    "organization.moh.phone": { presence: true },
    "organization.moh.address": { presence: true },
    "organization.moh.address.type": { presence: true },
    "organization.moh.address.use": { presence: true },
    "organization.moh.address.text": { presence: true },
  };
  let counter = 0;
  while (counter < observationCount) {
    // observations group validation constraints
    commonConstraints[
      `observations.${counter}.observation.practitionerResourceUuid`
    ] = { presence: true };
    commonConstraints[
      `observations.${counter}.observation.organizationLhpResourceUuid`
    ] = { presence: true };
    commonConstraints[`observations.${counter}.observation.acsn`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.observation.targetDisease`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.observation.testType`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.observation.result`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.observation.effectiveDateTime`] =
      { presence: true };
    commonConstraints[`observations.${counter}.observation.status`] = {
      presence: true,
    };

    // practitioner in observations  group validation constraints
    commonConstraints[`observations.${counter}.practitioner.fullName`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.practitioner.mcr`] = {
      presence: true,
    };
    commonConstraints[
      `observations.${counter}.practitioner.organizationMohResourceUuid`
    ] = { presence: true };

    // lhp organization in observations  group validation constraints
    commonConstraints[`observations.${counter}.organization.lhp.fullName`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.organization.lhp.type`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.organization.lhp.url`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.organization.lhp.phone`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.organization.lhp.address`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.organization.lhp.address.type`] =
      { presence: true };
    commonConstraints[`observations.${counter}.organization.lhp.address.use`] =
      { presence: true };
    commonConstraints[`observations.${counter}.organization.lhp.address.text`] =
      { presence: true };

    counter += 1;
  }
  return commonConstraints;
};

const artConstraints = {
  // Fields only ART HealthCerts should have
  "specimen.deviceResourceUuid": { presence: true },
  "device.type.system": { presence: true },
  "device.type.code": { presence: true },
  "device.type.display": { presence: true },
};

const getPcrConstraints = (observationCount: number) => {
  const pcrConstraints: any = {
    /* object validation constraints */
  };
  let counter = 0;
  while (counter < observationCount) {
    // observations group validation constraints
    pcrConstraints[
      `observations.${counter}.observation.organizationAlResourceUuid`
    ] = { presence: true };

    // al organization in observations  group validation constraints
    pcrConstraints[`observations.${counter}.organization.al.fullName`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.type`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.url`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.phone`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.address`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.address.type`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.address.use`] = {
      presence: true,
    };
    pcrConstraints[`observations.${counter}.organization.al.address.text`] = {
      presence: true,
    };

    counter += 1;
  }
  return pcrConstraints;
};

export const hasRequiredFields = (type: "ART" | "PCR", bundle: Bundle) => {
  let constraints = getCommonConstraints(bundle.observations.length);
  switch (type) {
    case "ART":
      constraints = { ...constraints, ...artConstraints };
      break;

    case "PCR":
      constraints = {
        ...constraints,
        ...getPcrConstraints(bundle.observations.length),
      };
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
