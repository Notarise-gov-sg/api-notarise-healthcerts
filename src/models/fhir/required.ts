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
      `observations.${counter}.observation.specimenResourceUuid`
    ] = { presence: true };
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

    // specimen validation constraints
    commonConstraints[`observations.${counter}.specimen.swabType.code`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.specimen.swabType.display`] = {
      presence: true,
    };
    commonConstraints[`observations.${counter}.specimen.collectionDateTime`] = {
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

const getArtConstraints = (observationCount: number) => {
  const artConstraints: any = {
    /* object validation constraints */
  };
  let counter = 0;
  while (counter < observationCount) {
    // observations group validation constraints
    artConstraints[`observations.${counter}.specimen.deviceResourceUuid`] = {
      presence: true,
    };

    // device validation constraints
    artConstraints[`observations.${counter}.device.type.system`] = {
      presence: true,
    };
    artConstraints[`observations.${counter}.device.type.code`] = {
      presence: true,
    };
    artConstraints[`observations.${counter}.device.type.display`] = {
      presence: true,
    };

    counter += 1;
  }
  return artConstraints;
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

export const hasRequiredFields = (
  type: "ART" | "PCR" | "SER",
  bundle: Bundle
) => {
  let constraints = getCommonConstraints(bundle.observations.length);
  switch (type) {
    case "ART":
      constraints = {
        ...constraints,
        ...getArtConstraints(bundle.observations.length),
      };
      break;

    // currently PCR and SER have same validation constraint for now
    case "PCR":
    case "SER":
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
    throw new Error(
      `The following required fields in fhirBundle are missing: ${JSON.stringify(
        errors
      )}`
    );
  }
};
