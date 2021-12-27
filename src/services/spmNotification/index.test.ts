import {
  notifyHealthCert,
  notifyPdt,
} from "@notarise-gov-sg/sns-notify-recipients";
import { ParsedBundle, GroupedObservation } from "../../models/fhir/types";
import { NotarisationResult, TestData } from "../../types";
import { config } from "../../config";
import { sendNotification } from "./index";

jest.mock("@notarise-gov-sg/sns-notify-recipients");

describe("single type oa-doc notification", () => {
  let parsedFhirBundleMock: ParsedBundle;
  let testDataMock: TestData[];
  let groupedObservationMock: GroupedObservation[];
  let resultMock: NotarisationResult;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    config.healthCertNotification.enabled = true;
  });
  beforeEach(() => {
    resultMock = {
      notarisedDocument: "notarisedDocument" as any,
      ttl: 12345678,
      url: "verify.sg/url",
      gpayCovidCardUrl: "gpay.com/url",
    };
    groupedObservationMock = [
      {
        observation: {
          testType: {
            code: "258500001",
            display: "Nasopharyngeal swab",
          },
          specimenResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12345",
          practitionerResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12346",
          organizationAlResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12347",
          organizationLhpResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12348",
          acsn: "123456789",
          targetDisease: {
            code: "840539006",
            display: "COVID-19",
          },
          result: {
            code: "260385009",
            display: "Negative",
          },
          effectiveDateTime: "2020-09-28T06:15:00Z",
          status: "final" as any,
        },
        specimen: {} as any,
        practitioner: {} as any,
        organization: {} as any,
      },
    ];
    parsedFhirBundleMock = {
      patient: {
        fullName: "Tan Chen Chen",
        nricFin: "S9098989Z",
        birthDate: "1990-01-15",
        passportNumber: "E7831177G",
        nationality: {
          code: "SG",
        },
      },
      observations: groupedObservationMock,
      organization: {} as any,
    };
    testDataMock = [
      {
        provider: "MacRitchie Medical Clinic",
        gender: "M",
        lab: "lab",
        nationality: "SG",
        nric: "123",
        observationDate: "6/28/21 2:15:00 PM GMT+08:00",
        passportNumber: "ES12345",
        patientName: "TESTING",
        performerMcr: "123",
        performerName: "123",
        birthDate: "01/01/2021",
        swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
        swabType: "Nasopharyngeal swab",
        swabTypeCode: "258500001",
        testCode: "94531-1",
        testType:
          "Reverse transcription polymerase chain reaction (rRT-PCR) test",
        testResult: "Negative",
        testResultCode: "260385009",
      },
    ];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    spy.mockRestore();
  });

  it("skip notifyHealthCert/notifyPdt for child valid test cert", async () => {
    // set patient dob to 5 years old (less than 15 years)
    parsedFhirBundleMock.patient.birthDate = new Date(
      new Date().getFullYear() - 5,
      1,
      1
    ).toISOString();
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("skip notifyHealthCert/notifyPdt for valid PCR test cert without nric/fin", async () => {
    // remove patient nric/fin
    delete parsedFhirBundleMock.patient.nricFin;
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("trigger notifyPdt for single valid SER test cert", async () => {
    // set test type code to SER
    parsedFhirBundleMock.observations[0].observation.testType = {
      code: "94661-6",
      display: "SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma",
    };
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );
    expect(notifyPdt).toBeCalledTimes(1);
    expect(notifyPdt).toHaveBeenCalledWith({
      nric: parsedFhirBundleMock.patient.nricFin,
      passportNumber: parsedFhirBundleMock.patient.passportNumber,
      testData: testDataMock,
      url: resultMock.url,
      validFrom: "2021-08-24T04:22:36.062Z",
    });
  });

  it("trigger notifyHealthCert for valid ART test cert", async () => {
    // set test type code to ART
    parsedFhirBundleMock.observations[0].observation.testType = {
      code: "697989009",
      display: "Anterior nares swab",
    };
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );

    expect(notifyHealthCert).toBeCalledTimes(1);
    expect(notifyHealthCert).toHaveBeenCalledWith({
      expiry: resultMock.ttl,
      type: "ART",
      uin: parsedFhirBundleMock.patient.nricFin,
      url: resultMock.url,
      version: "2.0",
    });
  });

  it("trigger notifyHealthCert for valid PCR test cert", async () => {
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );

    expect(notifyHealthCert).toBeCalledTimes(1);
    expect(notifyHealthCert).toHaveBeenCalledWith({
      expiry: resultMock.ttl,
      type: "PCR",
      uin: parsedFhirBundleMock.patient.nricFin,
      url: resultMock.url,
      version: "2.0",
    });
  });
});

describe("multi type oa-doc notification", () => {
  let parsedFhirBundleMock: ParsedBundle;
  let testDataMock: TestData[];
  let groupedObservationMock: GroupedObservation[];
  let resultMock: NotarisationResult;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    config.healthCertNotification.enabled = true;
  });
  beforeEach(() => {
    resultMock = {
      notarisedDocument: "notarisedDocument" as any,
      ttl: 12345678,
      url: "verify.sg/url",
      gpayCovidCardUrl: "gpay.com/url",
    };
    groupedObservationMock = [
      {
        observation: {
          testType: {
            code: "258500001",
            display: "Nasopharyngeal swab",
          },
          specimenResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12345",
          practitionerResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12346",
          organizationAlResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12347",
          organizationLhpResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-12348",
          acsn: "123456789",
          targetDisease: {
            code: "840539006",
            display: "COVID-19",
          },
          result: {
            code: "260385009",
            display: "Negative",
          },
          effectiveDateTime: "2020-09-28T06:15:00Z",
          status: "final" as any,
        },
        specimen: {} as any,
        practitioner: {} as any,
        organization: {} as any,
      },
      {
        observation: {
          testType: {
            code: "94661-6",
            display:
              "SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma",
          },
          specimenResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-123425",
          practitionerResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-123426",
          organizationAlResourceUuid: "urn:uuid:0275bfaf-48fb-44e0-80cd-123427",
          organizationLhpResourceUuid:
            "urn:uuid:0275bfaf-48fb-44e0-80cd-123428",
          acsn: "123456789",
          targetDisease: {
            code: "840539006",
            display: "COVID-19",
          },
          result: {
            code: "260385009",
            display: "Negative",
          },
          effectiveDateTime: "2020-09-28T06:15:00Z",
          status: "final" as any,
        },
        specimen: {} as any,
        practitioner: {} as any,
        organization: {} as any,
      },
    ];
    parsedFhirBundleMock = {
      patient: {
        fullName: "Tan Chen Chen",
        nricFin: "S9098989Z",
        birthDate: "1990-01-15",
        passportNumber: "E7831177G",
        nationality: {
          code: "SG",
        },
      },
      observations: groupedObservationMock,
      organization: {} as any,
    };
    testDataMock = [
      {
        provider: "MacRitchie Medical Clinic",
        gender: "M",
        lab: "lab",
        nationality: "SG",
        nric: "123",
        observationDate: "6/28/21 2:15:00 PM GMT+08:00",
        passportNumber: "ES12345",
        patientName: "TESTING",
        performerMcr: "123",
        performerName: "123",
        birthDate: "01/01/2021",
        swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
        swabType: "Nasopharyngeal swab",
        swabTypeCode: "258500001",
        testCode: "94531-1",
        testType:
          "Reverse transcription polymerase chain reaction (rRT-PCR) test",
        testResult: "Negative",
        testResultCode: "260385009",
      },
      {
        provider: "MacRitchie Medical Clinic",
        gender: "M",
        lab: "lab",
        nationality: "SG",
        nric: "123",
        observationDate: "6/28/21 2:15:00 PM GMT+08:00",
        passportNumber: "ES12345",
        patientName: "TESTING",
        performerMcr: "123",
        performerName: "123",
        birthDate: "01/01/2021",
        swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
        swabType: "Nasopharyngeal swab",
        swabTypeCode: "258500001",
        testCode: "94661-6",
        testType:
          "SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma",
        testResult: "Negative",
        testResultCode: "260385009",
      },
    ];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    spy.mockRestore();
  });

  it("skip notifyHealthCert/notifyPdt for child valid [PCR, SER] test cert", async () => {
    // set patient dob to 5 years old (less than 15 years)
    parsedFhirBundleMock.patient.birthDate = new Date(
      new Date().getFullYear() - 5,
      1,
      1
    ).toISOString();
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("skip notifyHealthCert/notifyPdt for [PCR, SER] test cert without nric/fin", async () => {
    // remove patient nric/fin
    delete parsedFhirBundleMock.patient.nricFin;
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("trigger notifyPdt for valid [PCR, SER] test cert", async () => {
    await sendNotification(
      resultMock,
      parsedFhirBundleMock,
      testDataMock,
      "2021-08-24T04:22:36.062Z"
    );
    expect(notifyPdt).toBeCalledTimes(1);
    expect(notifyPdt).toHaveBeenCalledWith({
      nric: parsedFhirBundleMock.patient.nricFin,
      passportNumber: parsedFhirBundleMock.patient.passportNumber,
      testData: testDataMock,
      url: resultMock.url,
      validFrom: "2021-08-24T04:22:36.062Z",
    });
  });
});
