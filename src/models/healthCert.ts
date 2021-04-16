// @ts-nocheck
// TODO: remove no check. The code to get test data was copied from health cert renderer which also did not enforce type safety
import { Patient } from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/moh/healthcert/1.0/schema";
import nationalities from "i18n-nationality";
import englishNationalities from "i18n-nationality/langs/en.json";
import { healthcert } from "@govtechsg/oa-schemata";
import { HealthCertDocument } from "../types";
import { validateHealthCertData } from "../common/healthCertDataValidation";
import { DataInvalidError } from "../common/error";

nationalities.registerLocale(englishNationalities);
const DATE_LOCALE = "en-SG";

const getPatientFromHealthCert = (document: HealthCertDocument) => {
  return document.fhirBundle.entry.find(
    entry => entry?.resourceType === "Patient"
  ) as Patient | undefined;
};

export const getParticularsFromHealthCert = (document: HealthCertDocument) => {
  const patient = getPatientFromHealthCert(document);

  const nric = patient?.identifier?.find(
    identifierEntry =>
      identifierEntry.type instanceof Object &&
      identifierEntry.type.text === "NRIC"
  );

  const fin = patient?.identifier?.find(
    identifierEntry =>
      identifierEntry.type instanceof Object &&
      identifierEntry.type.text === "FIN"
  );

  const ppn = patient?.identifier?.find(
    identifierEntry => identifierEntry.type === "PPN"
  );

  return { nric: nric?.value, fin: fin?.value, passportNumber: ppn?.value };
};

export interface TestData {
  provider: string;
  lab: string;
  swabType: string;
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
}

export const parseDateTime = (dateString: string | undefined): string => {
  return dateString
    ? `${Intl.DateTimeFormat(DATE_LOCALE, {
        timeStyle: "medium",
        dateStyle: "short",
        timeZone: "Asia/Singapore"
      })
        .format(new Date(dateString))
        .replace(",", "")} GMT+08:00`
    : "";
};

export const getTestDataFromHealthCert = (
  document: HealthCertDocument
): TestData[] => {
  const patient = document.fhirBundle.entry.find(
    entry => entry.resourceType === "Patient"
  );
  const observations = document.fhirBundle.entry.filter(
    entry => entry.resourceType === "Observation"
  );

  const { passportNumber, nric } = getParticularsFromHealthCert(document);

  const patientName =
    typeof patient?.name?.[0] === "object" ? patient?.name?.[0].text : "";
  const patientNationality = patient?.extension?.find(
    extension =>
      extension.url ===
      "http://hl7.org/fhir/StructureDefinition/patient-nationality"
  );

  const testData = [];

  // backward compatibility for healthcerts with no full url and only one test. auto resolve to first match instead
  if (observations.length === 1) {
    const observation = observations[0];
    const specimen = document.fhirBundle.entry.find(
      entry => entry.resourceType === "Specimen"
    );
    const provider = document.fhirBundle.entry.find(
      entry =>
        entry.resourceType === "Organization" &&
        entry.type === "Licensed Healthcare Provider"
    );
    const lab = document.fhirBundle.entry.find(
      entry =>
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
      "10828004": "Positive"
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
    const nationality = nationalities.getName(
      patientNationality?.code?.text ?? "",
      "en"
    );
    const gender =
      patient?.gender?.toLowerCase() === healthcert.Gender.Female.toLowerCase()
        ? "She"
        : "He";

    testData.push({
      provider: provider?.name,
      lab: lab?.name,
      swabType: swabType?.display,
      patientName,
      swabCollectionDate,
      performerName,
      performerMcr,
      observationDate,
      nric,
      passportNumber,
      birthDate: patient?.birthDate
        ?.split("-")
        ?.reverse()
        ?.join("/"),
      testType,
      nationality,
      gender,
      testResult
    });
  } else {
    observations.forEach(observation => {
      const specimenReference = observation?.specimen?.reference;
      const organisationReferences = observation?.performerReference?.map(
        organisation => organisation?.reference
      );

      // certs with multiple observations need to have reference to point the right specimens and organisations to the observation
      if (!specimenReference || !organisationReferences) {
        throw new DataInvalidError(["observation references"]);
      }

      const specimen = document.fhirBundle.entry.find(
        entry =>
          entry.resourceType === "Specimen" &&
          entry?.fullUrl === specimenReference
      );
      const provider = document.fhirBundle.entry.find(
        entry =>
          entry.resourceType === "Organization" &&
          entry.type === "Licensed Healthcare Provider" &&
          organisationReferences.includes(entry?.fullUrl)
      );
      const lab = document.fhirBundle.entry.find(
        entry =>
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
        "10828004": "Positive"
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

      const nationality = nationalities.getName(
        patientNationality?.code?.text ?? "",
        "en"
      );
      const gender =
        patient?.gender?.toLowerCase() ===
        healthcert.Gender.Female.toLowerCase()
          ? "She"
          : "He";

      testData.push({
        provider: provider?.name,
        lab: lab?.name,
        swabType: swabType?.display,
        patientName,
        swabCollectionDate,
        performerName,
        performerMcr,
        observationDate,
        nric,
        passportNumber,
        birthDate: patient?.birthDate
          ?.split("-")
          ?.reverse()
          ?.join("/"),
        testType,
        nationality,
        gender,
        testResult
      });
    });
  }
  validateHealthCertData(testData);
  return testData;
};
