import { pdtHealthcert as healthcert } from "@govtechsg/oa-schemata";
import moment from "moment-timezone";
import { TestData } from "src/types";
import { getNationality } from "../common/nationality";
import { Bundle } from "./fhir/types";

export const codesDict: Record<string, string> = {
  "260385009": "Negative",
  "10828004": "Positive",
};

export const parseDateTime = (dateString: string | undefined): string =>
  dateString
    ? `${moment
        .tz(dateString, "Asia/Singapore")
        .format("M/D/YY h:mm:ss A")} GMT+08:00`
    : "";

export const getTestDataFromParseFhirBundle = (
  parseFhirBundle: Bundle
): TestData[] => {
  const testData: TestData[] = [];
  parseFhirBundle.observations.forEach((observationGroup) => {
    const testResultCode = observationGroup.observation.result?.code || "";
    const testResult =
      testResultCode && testResultCode in codesDict
        ? codesDict[testResultCode]
        : "";

    const testCode = observationGroup.observation.testType?.code;
    const testType =
      testCode === "94531-1"
        ? "REAL TIME RT-PCR SWAB"
        : testCode === "94661-6"
        ? "SEROLOGY"
        : observationGroup.observation.testType?.display;

    const gender =
      parseFhirBundle.patient?.gender?.toLowerCase() ===
      healthcert.Gender.Female.toLowerCase()
        ? "She"
        : "He";

    const testDataValue: TestData = {
      provider: observationGroup.organization.lhp?.fullName,
      lab: observationGroup.organization.al?.fullName,
      swabType: observationGroup.specimen.swabType?.display || "",
      swabTypeCode: observationGroup.specimen.swabType?.code || "",
      patientName: parseFhirBundle.patient?.fullName,
      swabCollectionDate: parseDateTime(
        observationGroup.specimen.collectionDateTime
      ),
      performerName: observationGroup.practitioner?.fullName,
      performerMcr: observationGroup.practitioner?.mcr,
      observationDate: parseDateTime(
        observationGroup.observation?.effectiveDateTime
      ),
      nric: parseFhirBundle.patient?.nricFin || "",
      passportNumber: parseFhirBundle.patient?.passportNumber,
      birthDate: parseFhirBundle.patient?.birthDate
        ?.split("-")
        ?.reverse()
        ?.join("/"),
      testType: testType || "",
      nationality: getNationality(parseFhirBundle.patient?.nationality?.code),
      gender,
      testResult,
      testResultCode,
    };

    if (observationGroup.device) {
      testDataValue.deviceIdentifier = observationGroup.device.type.code;
    }
    testData.push(testDataValue);
  });
  return testData;
};
