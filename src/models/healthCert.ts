// @ts-nocheck
// TODO: remove no check. The code to get test data was copied from health cert renderer which also did not enforce type safety
import { Patient } from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/moh/pdt-healthcert/1.0/schema";
import { pdtHealthcert as healthcert } from "@govtechsg/oa-schemata";
import moment from "moment-timezone";
import { HealthCertDocument, PatientV2 } from "../types";
import { validateHealthCertData } from "../common/healthCertDataValidation";
import { DataInvalidError } from "../common/error";
import { getNationality } from "../common/nationality";

const getPatientFromHealthCert = (document: HealthCertDocument) =>
  document?.version === "pdt-healthcert-v2.0"
    ? (document.fhirBundle.entry.find(
        (entry) => entry?.resource?.resourceType === "Patient"
      ) as PatientV2 | undefined)
    : (document.fhirBundle.entry.find(
        (entry) => entry?.resourceType === "Patient"
      ) as Patient | undefined);

export const getParticularsFromHealthCertV1 = (
  patient: Patient | PatientV2
) => {
  const nric = patient?.identifier?.find(
    (identifierEntry) =>
      identifierEntry.type instanceof Object &&
      identifierEntry.type.text === "NRIC"
  );

  const fin = patient?.identifier?.find(
    (identifierEntry) =>
      identifierEntry.type instanceof Object &&
      identifierEntry.type.text === "FIN"
  );

  const ppn = patient?.identifier?.find(
    (identifierEntry) => identifierEntry.type === "PPN"
  );

  return { nric: nric?.value, fin: fin?.value, passportNumber: ppn?.value };
};

export const getParticularsFromHealthCertV2 = (
  patient: Patient | PatientV2
) => {
  const nric = patient?.resource.identifier?.find(
    (identifierEntry) =>
      identifierEntry instanceof Object && identifierEntry.id === "NRIC-FIN"
  );

  const fin = patient?.resource.identifier?.find(
    (identifierEntry) =>
      identifierEntry instanceof Object && identifierEntry.id === "NRIC-FIN"
  );

  const ppn = patient?.resource.identifier?.find(
    (identifierEntry) =>
      identifierEntry instanceof Object && identifierEntry.id === "PPN"
  );

  return { nric: nric?.value, fin: fin?.value, passportNumber: ppn?.value };
};

export const getParticularsFromHealthCert = (document: HealthCertDocument) => {
  const patient = getPatientFromHealthCert(document);
  return document?.version === "pdt-healthcert-v2.0"
    ? getParticularsFromHealthCertV2(patient)
    : getParticularsFromHealthCertV1(patient);
};

export interface TestData {
  provider: string;
  lab: string;
  swabType: string;
  swabTypeCode: string;
  patientName: string;
  swabCollectionDate: string;
  performerName: string;
  performerMcr: string;
  observationDate: string;
  nric: string;
  passportNumber: string;
  birthDate: string;
  testType: string;
  nationality: string;
  gender: string;
  testResult: string;
  testResultCode: string;
  deviceIdentifier?: string;
}

export const parseDateTime = (dateString: string | undefined): string =>
  dateString
    ? `${moment
        .tz(dateString, "Asia/Singapore")
        .format("M/D/YY h:mm:ss A")} GMT+08:00`
    : "";

export const getTestDataFromHealthCertV1 = (
  document: HealthCertDocument
): TestData[] => {
  const patient = document.fhirBundle.entry.find(
    (entry) => entry.resourceType === "Patient"
  );
  const observations = document.fhirBundle.entry.filter(
    (entry) => entry.resourceType === "Observation"
  );
  const device = document.fhirBundle.entry.find(
    (entry) => entry.resourceType === "Device"
  );

  const { passportNumber, nric } = getParticularsFromHealthCert(document);

  const patientName =
    typeof patient?.name?.[0] === "object" ? patient?.name?.[0].text : "";
  const patientNationality = patient?.extension?.find(
    (extension) =>
      extension.url ===
      "http://hl7.org/fhir/StructureDefinition/patient-nationality"
  );
  const deviceIdentifier =
    typeof device?.type?.coding?.[0] === "object"
      ? device?.type?.coding?.[0].code
      : null;

  const testData = [];

  // backward compatibility for healthcerts with no full url and only one test. auto resolve to first match instead
  if (observations.length === 1) {
    const observation = observations[0];
    const specimen = document.fhirBundle.entry.find(
      (entry) => entry.resourceType === "Specimen"
    );
    const provider = document.fhirBundle.entry.find(
      (entry) =>
        entry.resourceType === "Organization" &&
        entry.type === "Licensed Healthcare Provider"
    );
    const lab = document.fhirBundle.entry.find(
      (entry) =>
        entry.resourceType === "Organization" &&
        entry.type === "Accredited Laboratory"
    );

    const testCode = observation?.code?.coding?.[0]?.code;
    const testType =
      testCode === "94531-1"
        ? "REAL TIME RT-PCR SWAB"
        : testCode === "94661-6"
        ? "SEROLOGY"
        : observation?.code?.coding?.[0]?.display;

    let testResult = observation?.valueCodeableConcept?.coding[0]?.display;
    const testResultCode = observation?.valueCodeableConcept?.coding?.[0]?.code;
    const codesDict: Record<string, string> = {
      "260385009": "Negative",
      "10828004": "Positive",
    };
    if (testResultCode && testResultCode in codesDict) {
      testResult = codesDict[testResultCode];
    }

    const swabType =
      typeof specimen?.type === "object"
        ? specimen?.type.coding?.[0]
        : undefined;
    const swabCollectionDate = parseDateTime(
      specimen?.collection?.collectedDateTime
    );

    const performerName = observation?.performer?.name?.[0]?.text;
    const performerMcr = observation?.qualification?.[0]?.identifier;
    const observationDate = parseDateTime(observation?.effectiveDateTime);
    const nationality = getNationality(patientNationality?.code?.text ?? "");
    const gender =
      patient?.gender?.toLowerCase() === healthcert.Gender.Female.toLowerCase()
        ? "She"
        : "He";

    const testDataValue: TestData = {
      provider: provider?.name,
      lab: lab?.name,
      swabType: swabType?.display,
      swabTypeCode: swabType?.code,
      patientName,
      swabCollectionDate,
      performerName,
      performerMcr,
      observationDate,
      nric,
      passportNumber,
      birthDate: patient?.birthDate?.split("-")?.reverse()?.join("/"),
      testType,
      nationality,
      gender,
      testResult,
      testResultCode,
    };

    if (deviceIdentifier) {
      testDataValue.deviceIdentifier = deviceIdentifier;
    }
    testData.push(testDataValue);
  } else {
    observations.forEach((observation) => {
      const specimenReference = observation?.specimen?.reference;
      const organisationReferences = observation?.performerReference?.map(
        (organisation) => organisation?.reference
      );

      // certs with multiple observations need to have reference to point the right specimens and organisations to the observation
      if (!specimenReference || !organisationReferences) {
        throw new DataInvalidError(["observation references"]);
      }

      const specimen = document.fhirBundle.entry.find(
        (entry) =>
          entry.resourceType === "Specimen" &&
          entry?.fullUrl === specimenReference
      );
      const provider = document.fhirBundle.entry.find(
        (entry) =>
          entry.resourceType === "Organization" &&
          entry.type === "Licensed Healthcare Provider" &&
          organisationReferences.includes(entry?.fullUrl)
      );
      const lab = document.fhirBundle.entry.find(
        (entry) =>
          entry.resourceType === "Organization" &&
          entry.type === "Accredited Laboratory" &&
          organisationReferences.includes(entry?.fullUrl)
      );
      const testCode = observation?.code?.coding?.[0]?.code;
      const testType =
        testCode === "94531-1"
          ? "REAL TIME RT-PCR SWAB"
          : testCode === "94661-6"
          ? "SEROLOGY"
          : observation?.code?.coding?.[0]?.display;
      let testResult = observation?.valueCodeableConcept?.coding[0]?.display;
      const testResultCode =
        observation?.valueCodeableConcept?.coding?.[0]?.code;
      const codesDict: Record<string, string> = {
        "260385009": "Negative",
        "10828004": "Positive",
      };
      if (testResultCode && testResultCode in codesDict) {
        testResult = codesDict[testResultCode];
      }
      const swabType =
        typeof specimen?.type === "object"
          ? specimen?.type.coding?.[0]
          : undefined;
      const swabCollectionDate = parseDateTime(
        specimen?.collection?.collectedDateTime
      );

      const performerName = observation?.performer?.name?.[0]?.text;
      const performerMcr = observation?.qualification?.[0]?.identifier;
      const observationDate = parseDateTime(observation?.effectiveDateTime);

      const nationality = getNationality(patientNationality?.code?.text ?? "");
      const gender =
        patient?.gender?.toLowerCase() ===
        healthcert.Gender.Female.toLowerCase()
          ? "She"
          : "He";

      const testDataValue: TestData = {
        provider: provider?.name,
        lab: lab?.name,
        swabType: swabType?.display,
        swabTypeCode: swabType?.code,
        patientName,
        swabCollectionDate,
        performerName,
        performerMcr,
        observationDate,
        nric,
        passportNumber,
        birthDate: patient?.birthDate?.split("-")?.reverse()?.join("/"),
        testType,
        nationality,
        gender,
        testResult,
        testResultCode,
      };

      if (deviceIdentifier) {
        testDataValue.deviceIdentifier = deviceIdentifier;
      }
      testData.push(testDataValue);
    });
  }
  return testData;
};

export const getTestDataFromHealthCertV2 = (
  document: HealthCertDocument
): TestData[] => {
  const patient = document.fhirBundle.entry.find(
    (entry) => entry.resource.resourceType === "Patient"
  )?.resource;
  const observations = document.fhirBundle.entry.filter(
    (entry) => entry.resource.resourceType === "Observation"
  );
  const device = document.fhirBundle.entry.find(
    (entry) => entry.resource.resourceType === "Device"
  )?.resource;

  const { passportNumber, nric } = getParticularsFromHealthCert(document);

  const patientName =
    typeof patient?.name?.[0] === "object" ? patient?.name?.[0].text : "";
  const patientNationality = patient?.extension?.find(
    (extension) =>
      extension.url ===
      "http://hl7.org/fhir/StructureDefinition/patient-nationality"
  )?.extension?.[0]?.valueCodeableConcept;
  const deviceIdentifier =
    typeof device?.type?.coding?.[0] === "object"
      ? device?.type?.coding?.[0].code
      : null;

  const testData = [];

  // backward compatibility for healthcerts with no full url and only one test. auto resolve to first match instead
  if (observations.length === 1) {
    const observation = observations[0]?.resource;
    const specimen = document.fhirBundle.entry.find(
      (entry) => entry.resource.resourceType === "Specimen"
    )?.resource;
    const provider = document.fhirBundle.entry.find(
      (entry) =>
        entry.resource.resourceType === "Organization" &&
        entry.resource.type?.[0]?.text === "Licensed Healthcare Provider"
    )?.resource;
    const lab = document.fhirBundle.entry.find(
      (entry) =>
        entry.resource.resourceType === "Organization" &&
        entry.resource.type?.[0]?.text === "Accredited Laboratory"
    )?.resource;

    const testCode = observation?.code?.coding?.[0]?.code;
    const testType =
      testCode === "94531-1"
        ? "REAL TIME RT-PCR SWAB"
        : testCode === "94661-6"
        ? "SEROLOGY"
        : observation?.code?.coding?.[0]?.display;

    let testResult = observation?.valueCodeableConcept?.coding[0]?.display;
    const testResultCode = observation?.valueCodeableConcept?.coding?.[0]?.code;
    const codesDict: Record<string, string> = {
      "260385009": "Negative",
      "10828004": "Positive",
    };
    if (testResultCode && testResultCode in codesDict) {
      testResult = codesDict[testResultCode];
    }

    const swabType =
      typeof specimen?.type === "object"
        ? specimen?.type?.coding?.[0]
        : undefined;
    const swabCollectionDate = parseDateTime(
      specimen?.collection?.collectedDateTime
    );

    const performerReference = observation?.performer?.[0]?.reference;
    const performer = document.fhirBundle.entry.find(
      (entry) =>
        entry.resource.resourceType === "Practitioner" &&
        entry.fullUrl === performerReference
    )?.resource;

    const performerName = performer?.name?.[0]?.text;
    const performerMcr = `${performer?.qualification?.[0]?.identifier?.[0]?.id} ${performer?.qualification?.[0]?.identifier?.[0]?.value}`;
    const observationDate = parseDateTime(observation?.effectiveDateTime);
    const nationality = getNationality(
      patientNationality?.coding?.[0]?.code ?? ""
    );
    const gender =
      patient?.gender?.toLowerCase() === healthcert.Gender.Female.toLowerCase()
        ? "She"
        : "He";

    const testDataValue: TestData = {
      provider: provider?.name,
      lab: lab?.name,
      swabType: swabType?.display,
      swabTypeCode: swabType?.code,
      patientName,
      swabCollectionDate,
      performerName,
      performerMcr,
      observationDate,
      nric,
      passportNumber,
      birthDate: patient?.birthDate?.split("-")?.reverse()?.join("/"),
      testType,
      nationality,
      gender,
      testResult,
      testResultCode,
    };

    if (deviceIdentifier) {
      testDataValue.deviceIdentifier = deviceIdentifier;
    }
    testData.push(testDataValue);
  } else {
    observations.forEach((observation) => {
      const observationResource = observation?.resource;
      const specimenReference = observationResource?.specimen?.reference;
      const performerReference = observationResource?.performer?.find(
        (performer) => performer.type === "Practitioner"
      )?.reference;
      const organisationTypes = observationResource?.performer?.filter(
        (performer) => performer.type === "Organization"
      );
      const organisationReferences = organisationTypes.map(
        (organisation) => organisation?.reference
      );

      // certs with multiple observations need to have reference to point the right specimens and organisations to the observation
      if (!specimenReference || !organisationReferences) {
        throw new DataInvalidError(["observation references"]);
      }

      const specimen = document.fhirBundle.entry.find(
        (entry) =>
          entry.resource.resourceType === "Specimen" &&
          entry?.fullUrl === specimenReference
      )?.resource;
      const provider = document.fhirBundle.entry.find(
        (entry) =>
          entry.resource.resourceType === "Organization" &&
          entry.resource.type?.[0]?.text === "Licensed Healthcare Provider" &&
          organisationReferences.includes(entry?.fullUrl)
      )?.resource;
      const lab = document.fhirBundle.entry.find(
        (entry) =>
          entry.resource.resourceType === "Organization" &&
          entry.resource.type?.[0]?.text === "Accredited Laboratory" &&
          organisationReferences.includes(entry?.fullUrl)
      )?.resource;

      const testCode = observationResource?.code?.coding?.[0]?.code;
      const testType =
        testCode === "94531-1"
          ? "REAL TIME RT-PCR SWAB"
          : testCode === "94661-6"
          ? "SEROLOGY"
          : observationResource?.code?.coding?.[0]?.display;
      let testResult =
        observationResource?.valueCodeableConcept?.coding[0]?.display;
      const testResultCode =
        observationResource?.valueCodeableConcept?.coding?.[0]?.code;
      const codesDict: Record<string, string> = {
        "260385009": "Negative",
        "10828004": "Positive",
      };
      if (testResultCode && testResultCode in codesDict) {
        testResult = codesDict[testResultCode];
      }
      const swabType =
        typeof specimen?.type === "object"
          ? specimen?.type.coding?.[0]
          : undefined;
      const swabCollectionDate = parseDateTime(
        specimen?.collection?.collectedDateTime
      );

      const performer = document.fhirBundle.entry.find(
        (entry) =>
          entry.resource.resourceType === "Practitioner" &&
          entry.fullUrl === performerReference
      )?.resource;

      const performerName = performer?.name?.[0]?.text;
      const performerMcr = `${performer?.qualification?.[0]?.identifier?.[0]?.id} ${performer?.qualification?.[0]?.identifier?.[0]?.value}`;
      const observationDate = parseDateTime(
        observationResource?.effectiveDateTime
      );
      const nationality = getNationality(
        patientNationality?.coding?.[0]?.code ?? ""
      );
      const gender =
        patient?.gender?.toLowerCase() ===
        healthcert.Gender.Female.toLowerCase()
          ? "She"
          : "He";

      const testDataValue: TestData = {
        provider: provider?.name,
        lab: lab?.name,
        swabType: swabType?.display,
        swabTypeCode: swabType?.code,
        patientName,
        swabCollectionDate,
        performerName,
        performerMcr,
        observationDate,
        nric,
        passportNumber,
        birthDate: patient?.birthDate?.split("-")?.reverse()?.join("/"),
        testType,
        nationality,
        gender,
        testResult,
        testResultCode,
      };

      if (deviceIdentifier) {
        testDataValue.deviceIdentifier = deviceIdentifier;
      }
      testData.push(testDataValue);
    });
  }
  return testData;
};

export const getTestDataFromHealthCert = (
  document: HealthCertDocument
): TestData[] => {
  const testData =
    document?.version === "pdt-healthcert-v2.0"
      ? getTestDataFromHealthCertV2(document)
      : getTestDataFromHealthCertV1(document);
  validateHealthCertData(testData);
  return testData;
};
