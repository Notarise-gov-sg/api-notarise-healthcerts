// @ts-nocheck
// TODO: remove no check. The code to get test data was copied from health cert renderer which also did not enforce type safety
import {
  Coding,
  Identifier,
  Patient
} from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/moh/healthcert/1.0/schema";
import countries from "i18n-iso-countries";
import englishCountries from "i18n-iso-countries/langs/en.json";
import { healthcert } from "@govtechsg/oa-schemata";
import { HealthCertDocument } from "../types";

countries.registerLocale(englishCountries);
const DATE_LOCALE = "en-sg";

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
  const ppn = patient?.identifier?.find(
    identifierEntry => identifierEntry.type === "PPN"
  );

  if (ppn === undefined) {
    throw new Error("Healthcert Malformed");
  }

  return { nric: nric?.value, passportNumber: ppn.value };
};

export interface TestData {
  observation: any;
  specimen: any;
  provider: any;
  lab: any;
  swabType: Coding;
  patientName: string;
  swabCollectionDate: string;
  performerName: string;
  performerMcr: string;
  observationDate: string;
  nric: Identifier;
  passportNumber: string;
  patient: any;
  testType: string;
  nationality: string;
  gender: string;
}

export const parseDateTime = (dateString: string | undefined): string => {
  return dateString
    ? new Date(dateString).toLocaleString(DATE_LOCALE, {
        timeZone: "UTC",
        timeZoneName: "short"
      })
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
    const nationality = countries.getName(
      patientNationality?.code?.text ?? "",
      "en"
    );
    const gender =
      patient?.gender.toLowerCase() === healthcert.Gender.Female.toLowerCase()
        ? "She"
        : "He";

    if (
      !(
        observation &&
        specimen &&
        provider &&
        lab &&
        swabType &&
        patientName &&
        swabCollectionDate &&
        performerName &&
        performerMcr &&
        observationDate &&
        passportNumber &&
        patient &&
        testType &&
        nationality &&
        gender
      )
    ) {
      throw new Error("Healthcert Malformed");
    }
    testData.push({
      observation,
      specimen,
      provider,
      lab,
      swabType,
      patientName,
      swabCollectionDate,
      performerName,
      performerMcr,
      observationDate,
      nric,
      passportNumber,
      patient,
      testType,
      nationality,
      gender
    });
  } else {
    observations.forEach(observation => {
      const specimenReference = observation?.specimen?.reference;
      const organisationReferences = observation?.performerReference?.map(
        organisation => organisation?.reference
      );

      // certs with multiple observations need to have reference to point the right specimens and organisations to the observation
      if (!specimenReference || !organisationReferences) {
        throw new Error("Healthcert Malformed");
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

      const nationality = countries.getName(
        patientNationality?.code?.text ?? "",
        "en"
      );
      const gender =
        patient?.gender.toLowerCase() === healthcert.Gender.Female.toLowerCase()
          ? "She"
          : "He";

      /* eslint-disable no-console */
      console.log("observation", observation);
      console.log("specimen", specimen);
      console.log("provider", provider);
      console.log("lab", lab);
      console.log("swabType", swabType);
      console.log("patientName", patientName);
      console.log("swabCollectionDate", swabCollectionDate);
      console.log("performerName", performerName);
      console.log("performerMcr", performerMcr);
      console.log("observationDate", observationDate);
      console.log("patient", patient);
      console.log("testType", testType);
      console.log("nationality", nationality);
      console.log("gender", gender);

      if (
        !(
          observation &&
          specimen &&
          provider &&
          lab &&
          swabType &&
          patientName &&
          swabCollectionDate &&
          performerName &&
          performerMcr &&
          observationDate &&
          passportNumber &&
          patient &&
          testType &&
          nationality &&
          gender
        )
      ) {
        throw new Error("Healthcert Malformed");
      }
      testData.push({
        observation,
        specimen,
        provider,
        lab,
        swabType,
        patientName,
        swabCollectionDate,
        performerName,
        performerMcr,
        observationDate,
        nric,
        passportNumber,
        patient,
        testType,
        nationality,
        gender
      });
    });
  }
  return testData;
};
