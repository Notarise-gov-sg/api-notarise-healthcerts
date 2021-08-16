import exampleHealthCertWithNricV2 from "../../test/fixtures/v2/example_healthcert_with_nric_unwrapped.json";
import exampleHealthCertWithoutNricV2 from "../../test/fixtures/v2/example_healthcert_without_nric_unwrapped.json";
import exampleMultiResultHealthCertV2 from "../../test/fixtures/v2/example_healthcert_multi_result_unwrapped.json";
import exampleArtHealthCertWithNricV2 from "../../test/fixtures/v2/example_art_healthcert_with_nric_unwrapped.json";
import {
  getParticularsFromHealthCert,
  getTestDataFromHealthCert,
  parseDateTime,
} from "./healthCert";
import { DataInvalidError } from "../common/error";

type testCert =
  | typeof exampleHealthCertWithNricV2
  | typeof exampleHealthCertWithoutNricV2
  | typeof exampleMultiResultHealthCertV2
  | typeof exampleArtHealthCertWithNricV2;
const getSwabCollectionDates = (document: testCert): string[] => {
  const entries: any[] = document.fhirBundle.entry;
  return entries
    .filter((entry) => entry?.resource?.collection?.collectedDateTime != null)
    .map((entry) => entry.resource.collection.collectedDateTime);
};

const getObservationDates = (document: testCert): (string | undefined)[] => {
  const entries: any[] = document.fhirBundle.entry;
  return entries
    .filter((entry) => entry?.resource?.effectiveDateTime != null)
    .map((entry) => entry.resource.effectiveDateTime);
};

describe("src/models/healthCert", () => {
  describe("getParticularsFromHealthCert", () => {
    test("should correctly extract patient particulars from a well formed healthcert containing nric", () => {
      expect(
        getParticularsFromHealthCert(exampleHealthCertWithNricV2 as any)
      ).toStrictEqual({
        nric: "S9098989Z",
        fin: "S9098989Z",
        passportNumber: "E7831177G",
      });
    });
    test("should correctly extract patient particulars from a well formed healthcert without nric", () => {
      expect(
        getParticularsFromHealthCert(exampleHealthCertWithoutNricV2 as any)
      ).toStrictEqual({
        nric: undefined,
        fin: undefined,
        passportNumber: "E7831177G",
      });
    });
  });
  describe("getTestDataFromHealthCert", () => {
    describe("single observation flow", () => {
      test("should correctly extract test data from a well formed ART healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleArtHealthCertWithNricV2
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleArtHealthCertWithNricV2
        );

        const swabCollectionDate = parseDateTime(swabCollectionDates[0]);
        const observationDate = parseDateTime(observationDates[0]);
        expect(
          getTestDataFromHealthCert(exampleArtHealthCertWithNricV2 as any)
        ).toStrictEqual([
          {
            lab: undefined,
            nric: "S9098989Z",
            observationDate,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic",
            swabCollectionDate,
            swabType: "Anterior nares swab",
            swabTypeCode: "697989009",
            testResult: "Negative",
            testResultCode: "260385009",
            testType:
              "SARS-CoV-2 (COVID-19) Ag [Presence] in Upper respiratory specimen by Rapid immunoassay",
            deviceIdentifier: "1232",
          },
        ]);
      });

      test("should throw error if ART healthcert not have device identifier", () => {
        const malformedHealthCert = exampleArtHealthCertWithNricV2 as any;
        malformedHealthCert.fhirBundle.entry.pop();
        expect(() =>
          getTestDataFromHealthCert(malformedHealthCert)
        ).toThrowError(DataInvalidError);
      });

      test("should correctly extract test data from a well formed PCR healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleHealthCertWithNricV2
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleHealthCertWithNricV2
        );

        const swabCollectionDate = parseDateTime(swabCollectionDates[0]);
        const observationDate = parseDateTime(observationDates[0]);

        expect(
          getTestDataFromHealthCert(exampleHealthCertWithNricV2 as any)
        ).toStrictEqual([
          {
            lab: "MacRitchie Laboratory",
            nric: "S9098989Z",
            observationDate,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic",
            swabCollectionDate,
            swabType: "Nasopharyngeal swab",
            swabTypeCode: "258500001",
            testResult: "Negative",
            testResultCode: "260385009",
            testType: "REAL TIME RT-PCR SWAB",
          },
        ]);
      });

      test("should throw error if observation object not found", () => {
        const malformedHealthCert = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Teletubby",
                identifier: [{ type: "NAME", value: "Lala" }],
              },
            ],
          },
        };

        expect(() =>
          getTestDataFromHealthCert(malformedHealthCert as any)
        ).toThrowError(DataInvalidError);
      });

      test("should throw error if valueCodeableConcept missing", () => {
        const malformedHealthCertWithoutValueCodeableConcept = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                specimen: {
                  reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d",
                },
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "94531-1",
                      display:
                        "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                    },
                  ],
                },
              },
              {
                resourceType: "Specimen",
                collection: {
                  collectedDateTime: "2020-09-27T06:15:00Z",
                },
              },
            ],
          },
        };
        expect(() =>
          getTestDataFromHealthCert(
            malformedHealthCertWithoutValueCodeableConcept as any
          )
        ).toThrowError(DataInvalidError);
      });

      test("should throw error if code missing", () => {
        const malformedHealthCertWithoutCode = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                specimen: {
                  reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d",
                },
                valueCodeableConcept: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "260385009",
                      display: "Negative",
                    },
                  ],
                },
              },
              {
                resourceType: "Specimen",
                collection: {
                  collectedDateTime: "2020-09-27T06:15:00Z",
                },
              },
            ],
          },
        };
        expect(() =>
          getTestDataFromHealthCert(malformedHealthCertWithoutCode as any)
        ).toThrowError(DataInvalidError);
      });

      test("should throw error if specimen reference is missing", () => {
        const malformedHealthCertWithoutSpecimenReference = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                valueCodeableConcept: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "260385009",
                      display: "Negative",
                    },
                  ],
                },
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "94531-1",
                      display:
                        "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                    },
                  ],
                },
              },
              {
                resourceType: "Specimen",
                collection: {
                  collectedDateTime: "2020-09-27T06:15:00Z",
                },
              },
            ],
          },
        };
        expect(() =>
          getTestDataFromHealthCert(
            malformedHealthCertWithoutSpecimenReference as any
          )
        ).toThrowError(DataInvalidError);
      });

      test("should throw error if specimen is missing", () => {
        const malformedHealthCertWithoutSpecimen = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                specimen: {
                  reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d",
                },
                valueCodeableConcept: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "260385009",
                      display: "Negative",
                    },
                  ],
                },
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "94531-1",
                      display:
                        "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                    },
                  ],
                },
              },
            ],
          },
        };
        expect(() =>
          getTestDataFromHealthCert(malformedHealthCertWithoutSpecimen as any)
        ).toThrowError(DataInvalidError);
      });
    });
    describe("multi observation flow", () => {
      test("should correctly extract test data from a well formed healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleMultiResultHealthCertV2
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleMultiResultHealthCertV2
        );

        const swabCollectionDate1 = parseDateTime(swabCollectionDates[0]);
        const observationDate1 = parseDateTime(observationDates[0]);
        const swabCollectionDate2 = parseDateTime(swabCollectionDates[1]);
        const observationDate2 = parseDateTime(observationDates[1]);

        expect(
          getTestDataFromHealthCert(exampleMultiResultHealthCertV2 as any)
        ).toStrictEqual([
          {
            lab: "MacRitchie Laboratory",
            nric: "S9098989Z",
            observationDate: observationDate1,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic",
            swabCollectionDate: swabCollectionDate1,
            swabType: "Nasopharyngeal swab",
            swabTypeCode: "258500001",
            testResult: "Negative",
            testResultCode: "260385009",
            testType: "REAL TIME RT-PCR SWAB",
          },
          {
            lab: "MacRitchie Laboratory2",
            nric: "S9098989Z",
            observationDate: observationDate2,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic2",
            swabCollectionDate: swabCollectionDate2,
            swabType: "Nasopharyngeal swab",
            swabTypeCode: "258500001",
            testResult: "Negative",
            testResultCode: "260385009",
            testType: "REAL TIME RT-PCR SWAB",
          },
        ]);
      });
    });
  });
});
