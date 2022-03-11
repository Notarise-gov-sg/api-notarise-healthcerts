import {
  notifyHealthCert,
  notifyPdt,
} from "@notarise-gov-sg/sns-notify-recipients";
import { TestData } from "@notarise-gov-sg/sns-notify-recipients/dist/types";
import { ParsedBundle, GroupedObservation } from "../../models/fhir/types";
import { NotarisationResult, PDTHealthCertV2 } from "../../types";
import { config } from "../../config";
import { sendNotification } from "./index";

jest.mock("@notarise-gov-sg/sns-notify-recipients");

const OLD_ENV = process.env;
describe("single type oa-doc notification", () => {
  let certificateData: PDTHealthCertV2;
  let resultMock: NotarisationResult;
  let groupedObservationMock: GroupedObservation[];
  let parsedFhirBundleMock: ParsedBundle;
  let testDataMock: TestData[];
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    config.healthCertNotification.enabled = true;
  });
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    certificateData = {
      validFrom: "2021-08-24T04:22:36.062Z",
      type: "PCR" as any,
    } as any;
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
        patientName: "Tan Chen Chen",
        swabCollectionDate: "",
        testType:
          "SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma",
        testResult: "Negative",
      },
    ];
  });
  afterEach(() => {
    jest.clearAllMocks();
    process.env = OLD_ENV;
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
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("skip notifyHealthCert/notifyPdt for valid PCR test cert without nric/fin", async () => {
    // remove patient nric/fin
    delete parsedFhirBundleMock.patient.nricFin;
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("trigger notifyHealthCert for single valid SER test cert Staging Env", async () => {
    process.env.STAGE = "stg";
    // set test type code to SER
    certificateData.type = "SER" as any;
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyHealthCert).toBeCalledTimes(1);
    expect(notifyHealthCert).toHaveBeenCalledWith({
      expiry: resultMock.ttl,
      type: "SER",
      uin: parsedFhirBundleMock.patient.nricFin,
      url: resultMock.url,
      version: "2.0",
    });
  });

  it("trigger notifyPdt for single valid SER test cert Prod Env", async () => {
    process.env.STAGE = "production";
    // set test type code to SER
    certificateData.type = "SER" as any;
    parsedFhirBundleMock.observations[0].observation.testType = {
      code: "94661-6",
      display: "SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma",
    };
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyPdt).toBeCalledTimes(1);
    expect(notifyPdt).toHaveBeenCalledWith({
      nric: parsedFhirBundleMock.patient.nricFin,
      passportNumber: parsedFhirBundleMock.patient.passportNumber,
      testData: testDataMock,
      url: resultMock.url,
      validFrom: certificateData.validFrom,
    });
  });

  it("trigger notifyHealthCert for valid ART test cert", async () => {
    // set test type code to ART
    certificateData.type = "ART" as any;
    parsedFhirBundleMock.observations[0].observation.testType = {
      code: "697989009",
      display: "Anterior nares swab",
    };
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);

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
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);

    expect(notifyHealthCert).toBeCalledTimes(1);
    expect(notifyHealthCert).toHaveBeenCalledWith({
      expiry: resultMock.ttl,
      type: "PCR",
      uin: parsedFhirBundleMock.patient.nricFin,
      url: resultMock.url,
      version: "2.0",
    });
  });

  it("trigger notifyPdt for single valid LAMP test cert", async () => {
    // set test type code to LAMP
    certificateData.type = "LAMP" as any;
    parsedFhirBundleMock.observations[0].observation.testType = {
      code: "96986-5",
      display: "LUCIRA Test",
    };
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyPdt).toBeCalledTimes(1);
    expect(notifyPdt).toHaveBeenCalledWith({
      nric: parsedFhirBundleMock.patient.nricFin,
      passportNumber: parsedFhirBundleMock.patient.passportNumber,
      testData: [
        {
          patientName: testDataMock[0].patientName,
          swabCollectionDate: testDataMock[0].swabCollectionDate,
          testResult: testDataMock[0].testResult,
          testType: "LUCIRA Test",
        },
      ],
      url: resultMock.url,
      validFrom: certificateData.validFrom,
    });
  });
});

describe("multi type oa-doc notification", () => {
  let certificateData: PDTHealthCertV2;
  let resultMock: NotarisationResult;
  let groupedObservationMock: GroupedObservation[];
  let parsedFhirBundleMock: ParsedBundle;
  let testDataMock: TestData[];
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    config.healthCertNotification.enabled = true;
  });
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    certificateData = {
      validFrom: "2021-08-24T04:22:36.062Z",
      type: ["PCR", "SER"] as any,
    } as any;
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
        patientName: "Tan Chen Chen",
        swabCollectionDate: "",
        testType: "Nasopharyngeal swab",
        testResult: "Negative",
      },
      {
        patientName: "Tan Chen Chen",
        swabCollectionDate: "",
        testType:
          "SARS-CoV-2 (COVID-19) Ab [Interpretation] in Serum or Plasma",
        testResult: "Negative",
      },
    ];
  });
  afterEach(() => {
    jest.clearAllMocks();
    process.env = OLD_ENV;
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
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("skip notifyHealthCert/notifyPdt for [PCR, SER] test cert without nric/fin", async () => {
    // remove patient nric/fin
    delete parsedFhirBundleMock.patient.nricFin;
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyHealthCert).toBeCalledTimes(0);
    expect(notifyPdt).toBeCalledTimes(0);
  });

  it("trigger notifyHealthCert for valid [PCR, SER] test cert Staging Env", async () => {
    process.env.STAGE = "stg";
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyHealthCert).toBeCalledTimes(1);
    expect(notifyHealthCert).toHaveBeenCalledWith({
      expiry: resultMock.ttl,
      type: "PCR_SER",
      uin: parsedFhirBundleMock.patient.nricFin,
      url: resultMock.url,
      version: "2.0",
    });
  });

  it("trigger notifyPdt for valid [PCR, SER] test cert Prod Env", async () => {
    process.env.STAGE = "production";
    await sendNotification(resultMock, parsedFhirBundleMock, certificateData);
    expect(notifyPdt).toBeCalledTimes(1);
    expect(notifyPdt).toHaveBeenCalledWith({
      nric: parsedFhirBundleMock.patient.nricFin,
      passportNumber: parsedFhirBundleMock.patient.passportNumber,
      testData: testDataMock,
      url: resultMock.url,
      validFrom: certificateData.validFrom,
    });
  });
});
