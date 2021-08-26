import { R4 } from "@ahryman40k/ts-fhir-types";
import exampleHealthCertWithNric from "../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleHealthCertWithoutNric from "../../test/fixtures/v2/pdt_pcr_without_nric_unwrapped.json";
import exampleMultiResultHealthCert from "../../test/fixtures/v2/pdt_ser_multi_result_unwrapped.json";
import exampleArtHealthCertWithNric from "../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";
import { getTestDataFromParseFhirBundle, parseDateTime } from "./healthCertV2";
import fhirHelper from "./fhir";

type testCert =
  | typeof exampleHealthCertWithNric
  | typeof exampleHealthCertWithoutNric
  | typeof exampleMultiResultHealthCert
  | typeof exampleArtHealthCertWithNric;
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

describe("src/models/healthCertV2", () => {
  describe("getParticularsFromHealthCert", () => {
    test("should correctly extract patient particulars from a well formed healthcert containing nric", () => {
      const parseFhirBundle = fhirHelper.parse(
        exampleHealthCertWithNric.fhirBundle as R4.IBundle
      );
      expect(getTestDataFromParseFhirBundle(parseFhirBundle)).toStrictEqual([
        {
          birthDate: "15/01/1990",
          gender: "She",
          lab: "MacRitchie Laboratory",
          nationality: "Singaporean",
          nric: "S9098989Z",
          observationDate: "9/28/20 2:15:00 PM GMT+08:00",
          passportNumber: "E7831177G",
          patientName: "Tan Chen Chen",
          performerMcr: "123456",
          performerName: "Dr Michael Lim",
          provider: "MacRitchie Medical Clinic",
          swabCollectionDate: "9/27/20 2:15:00 PM GMT+08:00",
          swabType: "Nasopharyngeal swab",
          swabTypeCode: "258500001",
          testResult: "Negative",
          testResultCode: "260385009",
          testCode: "94531-1",
          testType:
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
        },
      ]);
    });
    test("should correctly extract patient particulars from a well formed healthcert without nric", () => {
      const parseFhirBundle = fhirHelper.parse(
        exampleHealthCertWithoutNric.fhirBundle as R4.IBundle
      );
      expect(getTestDataFromParseFhirBundle(parseFhirBundle)).toStrictEqual([
        {
          birthDate: "15/01/1990",
          gender: "She",
          lab: "MacRitchie Laboratory",
          nationality: "Singaporean",
          nric: "",
          observationDate: "9/28/20 2:15:00 PM GMT+08:00",
          passportNumber: "E7831177G",
          patientName: "Tan Chen Chen",
          performerMcr: "123456",
          performerName: "Dr Michael Lim",
          provider: "MacRitchie Medical Clinic",
          swabCollectionDate: "9/27/20 2:15:00 PM GMT+08:00",
          swabType: "Nasopharyngeal swab",
          swabTypeCode: "258500001",
          testResult: "Negative",
          testResultCode: "260385009",
          testCode: "94531-1",
          testType:
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
        },
      ]);
    });
  });
  describe("getTestDataFromHealthCert", () => {
    describe("single observation flow", () => {
      test("should correctly extract test data from a well formed ART healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleArtHealthCertWithNric
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleArtHealthCertWithNric
        );

        const swabCollectionDate = parseDateTime(swabCollectionDates[0]);
        const observationDate = parseDateTime(observationDates[0]);
        const parseFhirBundle = fhirHelper.parse(
          exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
        );
        expect(getTestDataFromParseFhirBundle(parseFhirBundle)).toStrictEqual([
          {
            lab: undefined,
            nric: "S9098989Z",
            observationDate,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "123456",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic",
            swabCollectionDate,
            swabType: "Anterior nares swab",
            swabTypeCode: "697989009",
            testResult: "Negative",
            testResultCode: "260385009",
            testCode: "94531-1",
            testType:
              "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
            deviceIdentifier: "1232",
          },
        ]);
      });

      test("should correctly extract test data from a well formed PCR healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleHealthCertWithNric
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleHealthCertWithNric
        );

        const swabCollectionDate = parseDateTime(swabCollectionDates[0]);
        const observationDate = parseDateTime(observationDates[0]);
        const parseFhirBundle = fhirHelper.parse(
          exampleHealthCertWithNric.fhirBundle as R4.IBundle
        );
        expect(getTestDataFromParseFhirBundle(parseFhirBundle)).toStrictEqual([
          {
            lab: "MacRitchie Laboratory",
            nric: "S9098989Z",
            observationDate,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "123456",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic",
            swabCollectionDate,
            swabType: "Nasopharyngeal swab",
            swabTypeCode: "258500001",
            testResult: "Negative",
            testResultCode: "260385009",
            testCode: "94531-1",
            testType:
              "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
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
          // @ts-ignore
          fhirHelper.parse(malformedHealthCert.fhirBundle as R4.IBundle)
        ).toThrowError(Error);
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
          fhirHelper.parse(
            // @ts-ignore
            malformedHealthCertWithoutValueCodeableConcept.fhirBundle as R4.IBundle
          )
        ).toThrowError(Error);
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
          fhirHelper.parse(
            // @ts-ignore
            malformedHealthCertWithoutCode.fhirBundle as R4.IBundle
          )
        ).toThrowError(Error);
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
          fhirHelper.parse(
            // @ts-ignore
            malformedHealthCertWithoutSpecimenReference.fhirBundle as R4.IBundle
          )
        ).toThrowError(Error);
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
          fhirHelper.parse(
            // @ts-ignore
            malformedHealthCertWithoutSpecimen.fhirBundle as R4.IBundle
          )
        ).toThrowError(Error);
      });
    });
    describe("multi observation flow", () => {
      test("should correctly extract test data from a well formed healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleMultiResultHealthCert
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleMultiResultHealthCert
        );

        const swabCollectionDate1 = parseDateTime(swabCollectionDates[0]);
        const observationDate1 = parseDateTime(observationDates[0]);
        const swabCollectionDate2 = parseDateTime(swabCollectionDates[1]);
        const observationDate2 = parseDateTime(observationDates[1]);

        const parseFhirBundle = fhirHelper.parse(
          exampleMultiResultHealthCert.fhirBundle as R4.IBundle
        );

        expect(getTestDataFromParseFhirBundle(parseFhirBundle)).toStrictEqual([
          {
            lab: "MacRitchie Laboratory",
            nric: "S9098989Z",
            observationDate: observationDate1,
            passportNumber: "E7831177G",
            birthDate: "15/01/1990",
            patientName: "Tan Chen Chen",
            nationality: "Singaporean",
            gender: "She",
            performerMcr: "123214",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic",
            swabCollectionDate: swabCollectionDate1,
            swabType: "Nasopharyngeal swab",
            swabTypeCode: "258500001",
            testResult: "Negative",
            testResultCode: "260385009",
            testCode: "94531-1",
            testType:
              "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
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
            performerMcr: "123214",
            performerName: "Dr Michael Lim",
            provider: "MacRitchie Medical Clinic2",
            swabCollectionDate: swabCollectionDate2,
            swabType: "Nasopharyngeal swab",
            swabTypeCode: "258500001",
            testResult: "Negative",
            testResultCode: "260385009",
            testCode: "94531-1",
            testType:
              "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
          },
        ]);
      });
    });
  });
});
