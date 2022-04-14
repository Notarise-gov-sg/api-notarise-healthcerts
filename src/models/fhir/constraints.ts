import _ from "lodash";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { isNRICValid } from "@notarise-gov-sg/sns-notify-recipients/dist/services/validateNRIC";
import { CodedError } from "../../common/error";
import euDccTestResultMapping from "../../static/EU-DCC-test-result.mapping.json";

/**
 * Common constraints required by all types of HealthCerts:
 * To convert parsed format -> original FHIR Bundle format (to aid in custom error message)
 */
const commonFhirKeys = {
  // Patient
  "patient.fullName": "Patient.name[0].text",
  "patient.birthDate": "Patient.birthDate",

  "patient.nationality.system":
    "Patient.extension[0].extension[url=code].valueCodeableConcept.coding[0].system",
  "patient.nationality.code":
    "Patient.extension[0].extension[url=code].valueCodeableConcept.coding[0].code",

  "patient.passportNumber": "Patient.identifier[0].{ id=PPN, type, value }",

  // Organization (MOH)
  "organization.moh.fullName": "Organization.name",

  "organization.moh.type.system": "Organization.type[0].coding[0].system",
  "organization.moh.type.code": "Organization.type[0].coding[0].code",
  "organization.moh.type.display": "Organization.type[0].coding[0].display",

  "organization.moh.url":
    "Organization.contact[0].telecom[0].{ system=url, value }",
  "organization.moh.phone":
    "Organization.contact[0].telecom[1].{ system=phone, value }",

  "organization.moh.address.type": "Organization.contact[0].address.type",
  "organization.moh.address.use": "Organization.contact[0].address.use",
  "organization.moh.address.text": "Organization.contact[0].address.text",
};

/**
 * Common grouped constraints required by all types of HealthCerts:
 * To convert parsed format -> original FHIR Bundle format (to aid in custom error message)
 */
const commonGroupedFhirKeys = {
  // Observation(s)
  "observations._.observation.specimenResourceUuid":
    "_.Observation.specimen.{ type=Specimen, reference }",
  "observations._.observation.practitionerResourceUuid":
    "_.Observation.performer[0].{ type=Practitioner, reference }",
  "observations._.observation.organizationLhpResourceUuid":
    "_.Observation.performer[1].{ id=LHP, type=Organization, reference }",

  "observations._.observation.acsn": "_.Observation.identifier[id=ACSN].value",

  "observations._.observation.targetDisease.system":
    "_.Observation.category[0].coding[0].system",
  "observations._.observation.targetDisease.code":
    "_.Observation.category[0].coding[0].code",
  "observations._.observation.targetDisease.display":
    "_.Observation.category[0].coding[0].display",

  "observations._.observation.testType.system":
    "_.Observation.code.coding[0].system",
  "observations._.observation.testType.code":
    "_.Observation.code.coding[0].code",
  "observations._.observation.testType.display":
    "_.Observation.code.coding[0].display",

  "observations._.observation.result.system":
    "_.Observation.valueCodeableConcept.coding[0].system",
  "observations._.observation.result.code":
    "_.Observation.valueCodeableConcept.coding[0].code",
  "observations._.observation.result.display":
    "_.Observation.valueCodeableConcept.coding[0].display",

  "observations._.observation.effectiveDateTime":
    "_.Observation.effectiveDateTime",
  "observations._.observation.status": "",

  // Specimen(s)
  "observations._.specimen.swabType.system": "_.Specimen.type.coding[0].system",
  "observations._.specimen.swabType.code": "_.Specimen.type.coding[0].code",
  "observations._.specimen.swabType.display":
    "_.Specimen.type.coding[0].display",

  "observations._.specimen.collectionDateTime":
    "_.Specimen.collection.collectedDateTime",

  // Practitioner(s)
  "observations._.practitioner.fullName": "_.Practitioner.name[0].text",
  "observations._.practitioner.mcr":
    "_.Practitioner.qualification[0].identifier[0].{ id=MCR, value }",
  "observations._.practitioner.organizationMohResourceUuid":
    "_.Practitioner.qualification[0].issuer.{ type=Organization, reference }",

  // Organization(s) (LHP)
  "observations._.organization.lhp.fullName": "_.Organization.name",

  "observations._.organization.lhp.type.system":
    "_.Organization.type[0].coding[0].system",
  "observations._.organization.lhp.type.code":
    "_.Organization.type[0].coding[0].code",
  "observations._.organization.lhp.type.display":
    "_.Organization.type[0].coding[0].display",

  "observations._.organization.lhp.url":
    "_.Organization.contact[0].telecom[0].{ system=url, value }",
  "observations._.organization.lhp.phone":
    "_.Organization.contact[0].telecom[1].{ system=phone, value }",

  "observations._.organization.lhp.address.type":
    "_.Organization.contact[0].address.type",
  "observations._.organization.lhp.address.use":
    "_.Organization.contact[0].address.use",
  "observations._.organization.lhp.address.text":
    "_.Organization.contact[0].address.text",
};

/**
 * ART constraints:
 * To convert parsed format -> original FHIR Bundle format (to aid in custom error message)
 */
const artGroupedFhirKeys = {
  // Specimen(s)
  "observations._.specimen.deviceResourceUuid":
    "_.Specimen.subject.{ type=Device, reference }",

  // Device(s)
  "observations._.device.type.system": "_.Device.type.coding[0].system",
  "observations._.device.type.code": "_.Device.type.coding[0].code",
  "observations._.device.type.display": "_.Device.type.coding[0].display",

  // Modality(s)
  "observations._.observation.modality":
    "_.Observation.note[n].{ id=MODALITY, text }",
};

/**
 * PCR/SER/LAMP constraints:
 * To convert parsed format -> original FHIR Bundle format (to aid in custom error message)
 */
const pcrSerLampGroupedFhirKeys = {
  // Observation(s)
  "observations._.observation.organizationAlResourceUuid":
    "Observation.performer[2].{ id=AL, type=Organization, reference }",

  // Organization(s) (AL)
  "observations._.organization.al.fullName": "_.Organization.name",

  "observations._.organization.al.type.system":
    "_.Organization.type[0].coding[0].system",
  "observations._.organization.al.type.code":
    "_.Organization.type[0].coding[0].code",
  "observations._.organization.al.type.display":
    "_.Organization.type[0].coding[0].display",

  "observations._.organization.al.url":
    "_.Organization.contact[0].telecom[0].{ system=url, value }",
  "observations._.organization.al.phone":
    "_.Organization.contact[0].telecom[1].{ system=phone, value }",

  "observations._.organization.al.address.type":
    "_.Organization.contact[0].address.type",
  "observations._.organization.al.address.use":
    "_.Organization.contact[0].address.use",
  "observations._.organization.al.address.text":
    "_.Organization.contact[0].address.text",
};

/**
 * Individual constraints of required fields for all HealthCert types
 */
const generateRequiredConstraints = (mapping: Record<string, string>) => {
  const allKeys = Object.keys(mapping);
  const constraints: Record<string, any> = {};

  allKeys.forEach((k) => {
    constraints[k] = {
      presence: {
        message: `'${mapping[k]}' is required`,
        allowEmpty: false,
      },
    };
  });

  return constraints;
};

/**
 * Grouped constraints of required fields for all HealthCert types
 */
const generateRequiredGroupedConstraints = (
  mapping: Record<string, string>,
  observationCount: number
) => {
  const allKeys = Object.keys(mapping);
  const constraints: Record<string, any> = {};

  for (let i = 0; i < observationCount; i += 1) {
    allKeys.forEach((k) => {
      const parsedKey = k.replace("_", i.toString());
      const fhirKey = mapping[k].replace("_", i.toString());
      constraints[parsedKey] = {
        presence: { message: `'${fhirKey}' is required`, allowEmpty: false },
      };
    });
  }

  return constraints;
};

export type Type = pdtHealthCertV2.PdtTypes | pdtHealthCertV2.PdtTypes[];
export const getRequiredConstraints = (
  type: Type,
  observationCount: number
) => {
  const { PdtTypes } = pdtHealthCertV2;

  const supportedMultiType = [PdtTypes.Pcr, PdtTypes.Ser]; // For now, only ["PCR", "SER"] is supported
  const isValidMultiType = _.isEqual(
    _.sortBy(supportedMultiType),
    _.sortBy(type)
  );

  if (type === PdtTypes.Art) {
    // ART HealthCert
    return {
      ...generateRequiredConstraints(commonFhirKeys),
      ...generateRequiredGroupedConstraints(
        commonGroupedFhirKeys,
        observationCount
      ),
      ...generateRequiredGroupedConstraints(
        artGroupedFhirKeys,
        observationCount
      ),
    };
  } else if (
    type === PdtTypes.Lamp ||
    type === PdtTypes.Pcr ||
    type === PdtTypes.Ser ||
    isValidMultiType
  ) {
    // LAMP, PCR, SER or PCR + SER HealthCert
    // Currently PCR and SER have the same validation constraint
    return {
      ...generateRequiredConstraints(commonFhirKeys),
      ...generateRequiredGroupedConstraints(
        commonGroupedFhirKeys,
        observationCount
      ),
      ...generateRequiredGroupedConstraints(
        pcrSerLampGroupedFhirKeys,
        observationCount
      ),
    };
  } else {
    throw new CodedError(
      "INVALID_HEALTHCERT_TYPE",
      `Notarise does not support endorsement of this HealthCert Type: ${JSON.stringify(
        type
      )}`
    );
  }
};

/**
 * Constraints of recognised/accepted values according to HealthCert type
 */
export const getRecognisedConstraints = (
  type: Type,
  observationCount: number
) => {
  const constraints: Record<string, any> = {};

  /* 1. NRIC-FIN validation: Must produce a valid checksum */
  constraints["patient.nricFin"] = { nricFin: { allowEmpty: true } };

  /* 2. Inclusion validation: For each Observation, limit to 2 sets of Test Result Codes */
  const recognisedTestResultCodes = [
    ...Object.keys(euDccTestResultMapping),
    ...Object.values(euDccTestResultMapping),
  ];
  for (let i = 0; i < observationCount; i += 1) {
    const key = `observations._.observation.result.code`;
    const friendlyKey = commonGroupedFhirKeys[key];

    const numKey = key.replace("_", i.toString());
    const numFriendlyKey = friendlyKey.replace("_", i.toString());

    constraints[numKey] = {
      inclusion: {
        within: recognisedTestResultCodes,
        message: `'${numFriendlyKey}' is an unrecognised test result code - please use one of the following codes: ${recognisedTestResultCodes}`,
      },
    };
  }

  /* 3. ART Modality field: Limit to "Administered", "Supervised" or "Remotely Supervised" */
  const recongisedArtModalityValues = [
    "Administered",
    "Supervised",
    "Remotely Supervised",
  ];
  if (type === pdtHealthCertV2.PdtTypes.Art) {
    for (let i = 0; i < observationCount; i += 1) {
      const key = `observations._.observation.modality`;
      const friendlyKey = artGroupedFhirKeys[key];

      const numKey = key.replace("_", i.toString());
      const numFriendlyKey = friendlyKey.replace("_", i.toString());

      constraints[numKey] = {
        inclusion: {
          within: recongisedArtModalityValues,
          message: `'${numFriendlyKey}' is an unrecognised modality value - please use one of the following values: ${recongisedArtModalityValues}`,
        },
      };
    }
  }

  return constraints;
};

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
