import exampleHealthCertWithNric from "../../test/fixtures/example_healthcert_with_nric_unwrapped.json";
import exampleHealthCertWithoutNric from "../../test/fixtures/example_healthcert_without_nric_unwrapped.json";
import exampleMultiResultHealthCert from "../../test/fixtures/example_healthcert_multi_result_unwrapped.json";
import {
  getParticularsFromHealthCert,
  getTestDataFromHealthCert,
  parseDateTime
} from "./healthCert";

type testCert =
  | typeof exampleHealthCertWithNric
  | typeof exampleHealthCertWithoutNric
  | typeof exampleMultiResultHealthCert;
const getSwabCollectionDates = (document: testCert): string[] => {
  const entries: any[] = document.fhirBundle.entry;
  return entries
    .filter(entry => entry?.collection?.collectedDateTime != null)
    .map(entry => entry.collection.collectedDateTime);
};

const getObservationDates = (document: testCert): (string | undefined)[] => {
  const entries = document.fhirBundle.entry;
  return entries
    .filter(entry => entry?.effectiveDateTime != null)
    .map(entry => entry.effectiveDateTime);
};

describe("src/models/healthCert", () => {
  describe("getParticularsFromHealthCert", () => {
    test("should correctly extract patient particulars from a well formed healthcert containing nric", () => {
      expect(
        getParticularsFromHealthCert(exampleHealthCertWithNric as any)
      ).toStrictEqual({
        nric: "S9098989Z",
        passportNumber: "E7831177G"
      });
    });
    test("should correctly extract patient particulars from a well formed healthcert without nric", () => {
      expect(
        getParticularsFromHealthCert(exampleHealthCertWithoutNric as any)
      ).toStrictEqual({
        nric: undefined,
        passportNumber: "E7831177G"
      });
    });
    test("should throw error if patient object not found", () => {
      const malformedHealthCert = {
        fhirBundle: {
          entry: [
            {
              resourceType: "Teletubby",
              identifier: [{ type: "NAME", value: "Lala" }]
            }
          ]
        }
      };

      expect(() =>
        getParticularsFromHealthCert(malformedHealthCert as any)
      ).toThrowError(/Healthcert Malformed/);
    });
    test("should throw error if ppn missing or not string", () => {
      const malformedHealthCertWithoutPpn = {
        fhirBundle: {
          entry: [
            {
              resourceType: "Patient",
              identifier: [{ type: { text: "NRIC" }, value: "Lala" }]
            }
          ]
        }
      };
      expect(() =>
        getParticularsFromHealthCert(malformedHealthCertWithoutPpn as any)
      ).toThrowError(/Healthcert Malformed/);
    });
  });
  describe("getTestDataFromHealthCert", () => {
    describe("single observation flow ", () => {
      test("should correctly extract test data from a well formed healthcert", () => {
        const swabCollectionDates: string[] = getSwabCollectionDates(
          exampleHealthCertWithNric
        );
        const observationDates: (string | undefined)[] = getObservationDates(
          exampleHealthCertWithNric
        );

        const swabCollectionDate = parseDateTime(swabCollectionDates[0]);
        const observationDate = parseDateTime(observationDates[0]);

        expect(
          getTestDataFromHealthCert(exampleHealthCertWithNric as any)
        ).toStrictEqual([
          {
            lab: {
              contact: {
                address: {
                  text: "2 Thomson Avenue 4 Singapore 098888",
                  type: "physical",
                  use: "work"
                },
                telecom: [
                  {
                    system: "phone",
                    value: "+6562711188"
                  }
                ]
              },
              name: "MacRitchie Laboratory",
              resourceType: "Organization",
              type: "Accredited Laboratory"
            },
            nric: "S9098989Z",
            observation: {
              code: {
                coding: [
                  {
                    code: "94531-1",
                    display:
                      "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                    system: "http://loinc.org"
                  }
                ]
              },
              effectiveDateTime: "2020-09-28T06:15:00Z",
              identifier: [
                {
                  type: "ACSN",
                  value: "123456789"
                }
              ],
              performer: {
                name: [{ text: "Dr Michael Lim" }]
              },
              qualification: [
                {
                  identifier: "MCR 123214",
                  issuer: "MOH"
                }
              ],
              resourceType: "Observation",
              status: "final",
              valueCodeableConcept: {
                coding: [
                  {
                    code: "260385009",
                    display: "Negative",
                    system: "http://snomed.info/sct"
                  }
                ]
              }
            },
            observationDate,
            passportNumber: "E7831177G",
            patient: {
              birthDate: "1990-01-15",
              extension: [
                {
                  code: {
                    text: "SG"
                  },
                  url:
                    "http://hl7.org/fhir/StructureDefinition/patient-nationality"
                }
              ],
              gender: "female",
              identifier: [
                {
                  type: "PPN",
                  value: "E7831177G"
                },
                {
                  type: {
                    text: "NRIC"
                  },
                  value: "S9098989Z"
                }
              ],
              name: [
                {
                  text: "Tan Chen Chen"
                }
              ],
              resourceType: "Patient"
            },
            patientName: "Tan Chen Chen",
            nationality: "Singapore",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: {
              contact: {
                address: {
                  text: "MacRitchie Hospital Thomson Road Singapore 123000",
                  type: "physical",
                  use: "work"
                },
                telecom: [
                  {
                    system: "phone",
                    value: "+6563113111"
                  }
                ]
              },
              endpoint: {
                address: "https://www.macritchieclinic.com.sg"
              },
              name: "MacRitchie Medical Clinic",
              resourceType: "Organization",
              type: "Licensed Healthcare Provider"
            },
            specimen: {
              collection: {
                collectedDateTime: "2020-09-27T06:15:00Z"
              },
              resourceType: "Specimen",
              type: {
                coding: [
                  {
                    code: "258500001",
                    display: "Nasopharyngeal swab",
                    system: "http://snomed.info/sct"
                  }
                ]
              }
            },
            swabCollectionDate,
            swabType: {
              code: "258500001",
              display: "Nasopharyngeal swab",
              system: "http://snomed.info/sct"
            },
            testType: "REAL TIME RT-PCR SWAB"
          }
        ]);
      });

      test("should throw error if observation object not found", () => {
        const malformedHealthCert = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Teletubby",
                identifier: [{ type: "NAME", value: "Lala" }]
              }
            ]
          }
        };

        expect(() =>
          getTestDataFromHealthCert(malformedHealthCert as any)
        ).toThrowError(/Healthcert Malformed/);
      });

      test("should throw error if valueCodeableConcept missing", () => {
        const malformedHealthCertWithoutValueCodeableConcept = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                specimen: {
                  reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d"
                },
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "94531-1",
                      display:
                        "Reverse transcription polymerase chain reaction (rRT-PCR) test"
                    }
                  ]
                }
              },
              {
                resourceType: "Specimen",
                collection: {
                  collectedDateTime: "2020-09-27T06:15:00Z"
                }
              }
            ]
          }
        };
        expect(() =>
          getTestDataFromHealthCert(
            malformedHealthCertWithoutValueCodeableConcept as any
          )
        ).toThrowError(/Healthcert Malformed/);
      });

      test("should throw error if code missing", () => {
        const malformedHealthCertWithoutCode = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                specimen: {
                  reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d"
                },
                valueCodeableConcept: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "260385009",
                      display: "Negative"
                    }
                  ]
                }
              },
              {
                resourceType: "Specimen",
                collection: {
                  collectedDateTime: "2020-09-27T06:15:00Z"
                }
              }
            ]
          }
        };
        expect(() =>
          getTestDataFromHealthCert(malformedHealthCertWithoutCode as any)
        ).toThrowError(/Healthcert Malformed/);
      });

      test("should throw error if specimen reference is missing ", () => {
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
                      display: "Negative"
                    }
                  ]
                },
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "94531-1",
                      display:
                        "Reverse transcription polymerase chain reaction (rRT-PCR) test"
                    }
                  ]
                }
              },
              {
                resourceType: "Specimen",
                collection: {
                  collectedDateTime: "2020-09-27T06:15:00Z"
                }
              }
            ]
          }
        };
        expect(() =>
          getTestDataFromHealthCert(
            malformedHealthCertWithoutSpecimenReference as any
          )
        ).toThrowError(/Healthcert Malformed/);
      });

      test("should throw error if specimen is missing", () => {
        const malformedHealthCertWithoutSpecimen = {
          fhirBundle: {
            entry: [
              {
                resourceType: "Observation",
                specimen: {
                  reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d"
                },
                valueCodeableConcept: {
                  coding: [
                    {
                      system: "http://snomed.info/sct",
                      code: "260385009",
                      display: "Negative"
                    }
                  ]
                },
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "94531-1",
                      display:
                        "Reverse transcription polymerase chain reaction (rRT-PCR) test"
                    }
                  ]
                }
              }
            ]
          }
        };
        expect(() =>
          getTestDataFromHealthCert(malformedHealthCertWithoutSpecimen as any)
        ).toThrowError(/Healthcert Malformed/);
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

        expect(
          getTestDataFromHealthCert(exampleMultiResultHealthCert as any)
        ).toStrictEqual([
          {
            lab: {
              contact: {
                address: {
                  text: "2 Thomson Avenue 4 Singapore 098888",
                  type: "physical",
                  use: "work"
                },
                telecom: [{ system: "phone", value: "+6562711188" }]
              },
              fullUrl: "urn:uuid:eeee1321-4af5-424c-a0e1-ed3aab1c349d",
              name: "MacRitchie Laboratory",
              resourceType: "Organization",
              type: "Accredited Laboratory"
            },
            nric: "S9098989Z",
            observation: {
              code: {
                coding: [
                  {
                    code: "94531-1",
                    display:
                      "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                    system: "http://loinc.org"
                  }
                ]
              },
              effectiveDateTime: "2020-09-28T06:15:00Z",
              fullUrl: "urn:uuid:cccc1321-4af5-424c-a0e1-ed3aab1c349d",
              identifier: [
                {
                  type: "ACSN",
                  value: "123456789"
                }
              ],
              performer: {
                name: [
                  {
                    text: "Dr Michael Lim"
                  }
                ]
              },
              performerReference: [
                {
                  reference: "urn:uuid:dddd1321-4af5-424c-a0e1-ed3aab1c349d"
                },
                {
                  reference: "urn:uuid:eeee1321-4af5-424c-a0e1-ed3aab1c349d"
                }
              ],
              qualification: [{ identifier: "MCR 123214", issuer: "MOH" }],
              resourceType: "Observation",
              specimen: {
                reference: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d"
              },
              status: "final",
              valueCodeableConcept: {
                coding: [
                  {
                    code: "260385009",
                    display: "Negative",
                    system: "http://snomed.info/sct"
                  }
                ]
              }
            },
            observationDate: observationDate1,
            passportNumber: "E7831177G",
            patient: {
              birthDate: "1990-01-15",
              extension: [
                {
                  code: {
                    text: "SG"
                  },
                  url:
                    "http://hl7.org/fhir/StructureDefinition/patient-nationality"
                }
              ],
              fullUrl: "urn:uuid:aaaa1321-4af5-424c-a0e1-ed3aab1c349d",
              gender: "female",
              identifier: [
                {
                  type: "PPN",
                  value: "E7831177G"
                },
                {
                  type: {
                    text: "NRIC"
                  },
                  value: "S9098989Z"
                }
              ],
              name: [
                {
                  text: "Tan Chen Chen"
                }
              ],
              resourceType: "Patient"
            },
            patientName: "Tan Chen Chen",
            nationality: "Singapore",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: {
              contact: {
                address: {
                  text: "MacRitchie Hospital Thomson Road Singapore 123000",
                  type: "physical",
                  use: "work"
                },
                telecom: [
                  {
                    system: "phone",
                    value: "+6563113111"
                  }
                ]
              },
              endpoint: {
                address: "https://www.macritchieclinic.com.sg"
              },
              fullUrl: "urn:uuid:dddd1321-4af5-424c-a0e1-ed3aab1c349d",
              name: "MacRitchie Medical Clinic",
              resourceType: "Organization",
              type: "Licensed Healthcare Provider"
            },
            specimen: {
              collection: {
                collectedDateTime: "2020-09-27T06:15:00Z"
              },
              fullUrl: "urn:uuid:bbbb1321-4af5-424c-a0e1-ed3aab1c349d",
              resourceType: "Specimen",
              type: {
                coding: [
                  {
                    code: "258500001",
                    display: "Nasopharyngeal swab",
                    system: "http://snomed.info/sct"
                  }
                ]
              }
            },
            swabCollectionDate: swabCollectionDate1,
            swabType: {
              code: "258500001",
              display: "Nasopharyngeal swab",
              system: "http://snomed.info/sct"
            },
            testType: "REAL TIME RT-PCR SWAB"
          },
          {
            lab: {
              contact: {
                address: {
                  text: "2 Thomson Avenue 4 Singapore 098888",
                  type: "physical",
                  use: "work"
                },
                telecom: [
                  {
                    system: "phone",
                    value: "+6562711188"
                  }
                ]
              },
              fullUrl: "urn:uuid:wwww1321-4af5-424c-a0e1-ed3aab1c349d",
              name: "MacRitchie Laboratory2",
              resourceType: "Organization",
              type: "Accredited Laboratory"
            },
            nric: "S9098989Z",
            observation: {
              code: {
                coding: [
                  {
                    code: "94531-1",
                    display:
                      "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                    system: "http://loinc.org"
                  }
                ]
              },
              effectiveDateTime: "2020-09-28T06:15:00Z",
              fullUrl: "urn:uuid:yyyy1321-4af5-424c-a0e1-ed3aab1c349d",
              identifier: [
                {
                  type: "ACSN",
                  value: "123456789"
                }
              ],
              performer: {
                name: [
                  {
                    text: "Dr Michael Lim"
                  }
                ]
              },
              performerReference: [
                {
                  reference: "urn:uuid:xxxx1321-4af5-424c-a0e1-ed3aab1c349d"
                },
                {
                  reference: "urn:uuid:wwww1321-4af5-424c-a0e1-ed3aab1c349d"
                }
              ],
              qualification: [
                {
                  identifier: "MCR 123214",
                  issuer: "MOH"
                }
              ],
              resourceType: "Observation",
              specimen: {
                reference: "urn:uuid:zzzz1321-4af5-424c-a0e1-ed3aab1c349d"
              },
              status: "final",
              valueCodeableConcept: {
                coding: [
                  {
                    code: "260385009",
                    display: "Negative",
                    system: "http://snomed.info/sct"
                  }
                ]
              }
            },
            observationDate: observationDate2,
            passportNumber: "E7831177G",
            patient: {
              birthDate: "1990-01-15",
              extension: [
                {
                  code: {
                    text: "SG"
                  },
                  url:
                    "http://hl7.org/fhir/StructureDefinition/patient-nationality"
                }
              ],
              fullUrl: "urn:uuid:aaaa1321-4af5-424c-a0e1-ed3aab1c349d",
              gender: "female",
              identifier: [
                {
                  type: "PPN",
                  value: "E7831177G"
                },
                {
                  type: {
                    text: "NRIC"
                  },
                  value: "S9098989Z"
                }
              ],
              name: [{ text: "Tan Chen Chen" }],
              resourceType: "Patient"
            },
            patientName: "Tan Chen Chen",
            nationality: "Singapore",
            gender: "She",
            performerMcr: "MCR 123214",
            performerName: "Dr Michael Lim",
            provider: {
              contact: {
                address: {
                  text: "MacRitchie Hospital Thomson Road Singapore 123000",
                  type: "physical",
                  use: "work"
                },
                telecom: [
                  {
                    system: "phone",
                    value: "+6563113111"
                  }
                ]
              },
              endpoint: {
                address: "https://www.macritchieclinic.com.sg"
              },
              fullUrl: "urn:uuid:xxxx1321-4af5-424c-a0e1-ed3aab1c349d",
              name: "MacRitchie Medical Clinic2",
              resourceType: "Organization",
              type: "Licensed Healthcare Provider"
            },
            specimen: {
              collection: {
                collectedDateTime: "2020-09-28T06:15:00Z"
              },
              fullUrl: "urn:uuid:zzzz1321-4af5-424c-a0e1-ed3aab1c349d",
              resourceType: "Specimen",
              type: {
                coding: [
                  {
                    code: "258500001",
                    display: "Nasopharyngeal swab",
                    system: "http://snomed.info/sct"
                  }
                ]
              }
            },
            swabCollectionDate: swabCollectionDate2,
            swabType: {
              code: "258500001",
              display: "Nasopharyngeal swab",
              system: "http://snomed.info/sct"
            },
            testType: "REAL TIME RT-PCR SWAB"
          }
        ]);
      });
    });
  });
});
