import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { R4 } from "@ahryman40k/ts-fhir-types";
import _ from "lodash";
import { genEuDccCertificates } from "./index";
import fhirHelper from "../fhir/index";
import exampleSingleTypePcrHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleSingleTypeArtHealthCertWithNric from "../../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";
import exampleMultiTypeHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_ser_multi_result_unwrapped.json";

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgZgp3uylFeCIIXozb
ZkCkSNr4DcLDxplZ1ax/u7ndXqahRANCAARkJeqyO85dyR+UrQ5Ey8EdgLyf9Nts
CrwORAj6T68/elL19aoISQDbzaNYJjdD77XdHtd+nFGTQVpB88wPTwgb
-----END PRIVATE KEY-----`;

const PUB_KEY_ID = `-----BEGIN CERTIFICATE-----
MIIBYDCCAQYCEQCAG8uscdLb0ppaneNN5sB7MAoGCCqGSM49BAMCMDIxIzAhBgNV
BAMMGk5hdGlvbmFsIENTQ0Egb2YgRnJpZXNsYW5kMQswCQYDVQQGEwJGUjAeFw0y
MTA0MjcyMDQ3MDVaFw0yNjAzMTIyMDQ3MDVaMDYxJzAlBgNVBAMMHkRTQyBudW1i
ZXIgd29ya2VyIG9mIEZyaWVzbGFuZDELMAkGA1UEBhMCRlIwWTATBgcqhkjOPQIB
BggqhkjOPQMBBwNCAARkJeqyO85dyR+UrQ5Ey8EdgLyf9NtsCrwORAj6T68/elL1
9aoISQDbzaNYJjdD77XdHtd+nFGTQVpB88wPTwgbMAoGCCqGSM49BAMCA0gAMEUC
IQDvDacGFQO3tuATpoqf40CBv09nfglL3wh5wBwA1uA7lAIgZ4sOK2iaaTsFNqEN
AF7zi+d862ePRQ9Lwymr7XfwVm0=
-----END CERTIFICATE-----`;

const { PdtTypes } = pdtHealthCertV2;

jest.mock("qrcode");

describe("genEuDccCertificates for Single Type OA Doc", () => {
  let dateNowSpy: jest.SpyInstance;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    dateNowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2021-06-30T00:00:00.000Z");

    // Set the variables
    process.env.SIGNING_EU_QR_PUBLIC_KEY = PUB_KEY_ID;
    process.env.SIGNING_EU_QR_PRIVATE_KEY = PRIVATE_KEY;
  });
  afterAll(() => {
    spy.mockRestore();
    dateNowSpy.mockRestore();
  });

  it("create EU vacc cert with valid PCR Type", async () => {
    const parsedFhirBundle = fhirHelper.parse(
      exampleSingleTypePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    const result = await genEuDccCertificates(
      PdtTypes.Pcr,
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        type: "PCR",
        expiryDateTime: "2021-06-30T00:00:00.000Z",
        qr: expect.stringMatching(/HC1:/),
      },
    ]);
  });

  it("create EU vacc cert with valid ART Type", async () => {
    const parsedFhirBundle = fhirHelper.parse(
      exampleSingleTypeArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    const result = await genEuDccCertificates(
      PdtTypes.Art,
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        type: "ART",
        expiryDateTime: "2021-06-30T00:00:00.000Z",
        qr: expect.stringMatching(/HC1:/),
      },
    ]);
  });
});

describe("genEuDccCertificates for Multiple Type OA Doc", () => {
  let dateNowSpy: jest.SpyInstance;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    dateNowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2021-06-30T00:00:00.000Z");

    // Set the variables
    process.env.SIGNING_EU_QR_PUBLIC_KEY = PUB_KEY_ID;
    process.env.SIGNING_EU_QR_PRIVATE_KEY = PRIVATE_KEY;
  });
  afterAll(() => {
    spy.mockRestore();
    dateNowSpy.mockRestore();
  });

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleMultiTypeHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("create EU vacc cert with valid [OLDPCR,SER] Doc Type", async () => {
    const result = await genEuDccCertificates(
      [PdtTypes.Pcr, PdtTypes.Ser],
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        type: "PCR",
        expiryDateTime: "2021-06-30T00:00:00.000Z",
        qr: expect.stringMatching(/HC1:/),
      },
    ]);
  });

  it("create EU vacc cert with valid [RecommededPCR,SER] Doc Type", async () => {
    parsedFhirBundle.observations[0].observation.testType.code = "94309-2"; // MOH recommended code
    const result = await genEuDccCertificates(
      [PdtTypes.Pcr, PdtTypes.Ser],
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        type: "PCR",
        expiryDateTime: "2021-06-30T00:00:00.000Z",
        qr: expect.stringMatching(/HC1:/),
      },
    ]);
  });
});
