import validate from "validate.js";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import _ from "lodash";
import { DocumentInvalidError } from "../../common/error";
import { ParsedBundle } from "./types";

const presenceValidator = { presence: { allowEmpty: false } };

const getCommonConstraints = (observationCount: number) => {
  const commonConstraints: any = {
    /* object validation constraints at here */

    // patient validation constraints
    "patient.fullName": presenceValidator,
    "patient.birthDate": presenceValidator,
    "patient.nationality.code": presenceValidator,
    "patient.passportNumber": presenceValidator,

    // organization `moh` validation constraints
    "organization.moh.fullName": presenceValidator,
    "organization.moh.type": presenceValidator,
    "organization.moh.url": presenceValidator,
    "organization.moh.phone": presenceValidator,
    "organization.moh.address": presenceValidator,
    "organization.moh.address.type": presenceValidator,
    "organization.moh.address.use": presenceValidator,
    "organization.moh.address.text": presenceValidator,
  };
  let counter = 0;
  while (counter < observationCount) {
    // observations group validation constraints
    commonConstraints[
      `observations.${counter}.observation.specimenResourceUuid`
    ] = presenceValidator;
    commonConstraints[
      `observations.${counter}.observation.practitionerResourceUuid`
    ] = presenceValidator;
    commonConstraints[
      `observations.${counter}.observation.organizationLhpResourceUuid`
    ] = presenceValidator;
    commonConstraints[`observations.${counter}.observation.acsn`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.observation.targetDisease`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.observation.testType`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.observation.result`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.observation.effectiveDateTime`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.observation.status`] =
      presenceValidator;

    // specimen validation constraints
    commonConstraints[`observations.${counter}.specimen.swabType.code`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.specimen.swabType.display`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.specimen.collectionDateTime`] =
      presenceValidator;

    // practitioner in observations  group validation constraints
    commonConstraints[`observations.${counter}.practitioner.fullName`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.practitioner.mcr`] =
      presenceValidator;
    commonConstraints[
      `observations.${counter}.practitioner.organizationMohResourceUuid`
    ] = presenceValidator;

    // lhp organization in observations  group validation constraints
    commonConstraints[`observations.${counter}.organization.lhp.fullName`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.type`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.url`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.phone`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.address`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.address.type`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.address.use`] =
      presenceValidator;
    commonConstraints[`observations.${counter}.organization.lhp.address.text`] =
      presenceValidator;

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
    artConstraints[`observations.${counter}.specimen.deviceResourceUuid`] =
      presenceValidator;

    // device validation constraints
    artConstraints[`observations.${counter}.device.type.system`] =
      presenceValidator;
    artConstraints[`observations.${counter}.device.type.code`] =
      presenceValidator;
    artConstraints[`observations.${counter}.device.type.display`] =
      presenceValidator;

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
    ] = presenceValidator;

    // al organization in observations  group validation constraints
    pcrConstraints[`observations.${counter}.organization.al.fullName`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.type`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.url`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.phone`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.address`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.address.type`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.address.use`] =
      presenceValidator;
    pcrConstraints[`observations.${counter}.organization.al.address.text`] =
      presenceValidator;

    counter += 1;
  }
  return pcrConstraints;
};

type Type = pdtHealthCertV2.PdtTypes | pdtHealthCertV2.PdtTypes[];
export const hasRequiredFields = (type: Type, bundle: ParsedBundle) => {
  const { PdtTypes } = pdtHealthCertV2;
  const supportedMultiType = [PdtTypes.Pcr, PdtTypes.Ser]; // For now, only ["PCR", "SER"] is supported
  const isValidMultiType = _.isEqual(
    _.sortBy(supportedMultiType),
    _.sortBy(type)
  );

  let constraints = getCommonConstraints(bundle.observations.length);

  if (type === PdtTypes.Art) {
    // ART HealthCert
    constraints = {
      ...constraints,
      ...getArtConstraints(bundle.observations.length),
    };
  } else if (
    // PCR, SER or PCR + SER HealthCert
    // Currently PCR and SER have the same validation constraint
    type === PdtTypes.Pcr ||
    type === PdtTypes.Ser ||
    isValidMultiType
  ) {
    constraints = {
      ...constraints,
      ...getPcrConstraints(bundle.observations.length),
    };
  } else {
    throw new DocumentInvalidError(
      `Notarise does not support endorsement of this HealthCert Type: ${JSON.stringify(
        type
      )}`
    );
  }

  const errors = validate(bundle, constraints);
  if (errors) {
    throw new DocumentInvalidError(
      `the following required fields in fhirBundle are missing: ${JSON.stringify(
        errors
      )}`
    );
  }
};
