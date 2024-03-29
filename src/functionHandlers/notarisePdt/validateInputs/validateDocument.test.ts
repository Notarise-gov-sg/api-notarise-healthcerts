import { verify, isValid } from "@govtechsg/oa-verify";
import _examplePcrHealthCertV1Wrapped from "../../../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import _examplePcrHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";
import _exampleArtHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_art_with_nric_wrapped.json";
import _examplePcrSerHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_pcr_ser_multi_result_wrapped.json";
import _exampleLampHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_lamp_wrapped.json";
import { validateV2Document } from "./validateDocument";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { CodedError } from "../../../common/error";
import mockImage from "./mock_image.json";

jest.mock("@govtechsg/oa-verify");

const mockVerify = verify as jest.Mock;
const mockIsValid = isValid as jest.Mock;

jest.mock("./../authorizedIssuers");
const mockIsAuthorizedIssuer = isAuthorizedIssuer as jest.Mock;

const examplePcrHealthCertV1Wrapped = _examplePcrHealthCertV1Wrapped as any;
const examplePcrHealthCertV2Wrapped = _examplePcrHealthCertV2Wrapped as any;
const exampleArtHealthCertV2Wrapped = _exampleArtHealthCertV2Wrapped as any;
const examplePcrSerHealthCertV2Wrapped =
  _examplePcrSerHealthCertV2Wrapped as any;
const exampleLampHealthCertV2Wrapped = _exampleLampHealthCertV2Wrapped as any;

const validFragments = [
  {
    type: "DOCUMENT_INTEGRITY",
    name: "OpenAttestationHash",
    data: true,
    status: "VALID",
  },
  {
    status: "SKIPPED",
    type: "DOCUMENT_STATUS",
    name: "OpenAttestationEthereumTokenRegistryStatus",
    reason: {
      code: 4,
      codeString: "SKIPPED",
      message:
        'Document issuers doesn\'t have "tokenRegistry" property or TOKEN_REGISTRY method',
    },
  },
  {
    status: "SKIPPED",
    type: "DOCUMENT_STATUS",
    name: "OpenAttestationEthereumDocumentStoreStatus",
    reason: {
      code: 4,
      codeString: "SKIPPED",
      message:
        'Document issuers doesn\'t have "documentStore" or "certificateStore" property or DOCUMENT_STORE method',
    },
  },
  {
    status: "SKIPPED",
    type: "ISSUER_IDENTITY",
    name: "OpenAttestationDnsTxt",
    reason: {
      code: 2,
      codeString: "SKIPPED",
      message:
        'Document issuers doesn\'t have "documentStore" / "tokenRegistry" property or doesn\'t use DNS-TXT type',
    },
  },
  {
    name: "OpenAttestationDnsDid",
    type: "ISSUER_IDENTITY",
    data: [
      {
        location: "donotverify.testing.verify.gov.sg",
        key: "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830#controller",
        status: "VALID",
      },
    ],
    status: "VALID",
  },
  {
    name: "OpenAttestationDidSignedDocumentStatus",
    type: "DOCUMENT_STATUS",
    data: {
      issuedOnAll: true,
      revokedOnAny: false,
      details: {
        issuance: [
          {
            issued: true,
            did: "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830",
          },
        ],
      },
    },
    status: "VALID",
  },
];

const whenFragmentsAreValid = () => {
  mockVerify.mockResolvedValue(validFragments);
  mockIsValid.mockReturnValue(true);
  mockIsAuthorizedIssuer.mockResolvedValue(true);
};

beforeEach(() => {
  mockVerify.mockReset();
  mockIsValid.mockReset();
  mockIsAuthorizedIssuer.mockReset();
  whenFragmentsAreValid();
});

it("should not throw on valid PCR v2 document", async () => {
  whenFragmentsAreValid();
  await expect(
    validateV2Document(examplePcrHealthCertV2Wrapped)
  ).resolves.not.toThrow();
});

it("should not throw on valid ART v2 document", async () => {
  whenFragmentsAreValid();
  await expect(
    validateV2Document(exampleArtHealthCertV2Wrapped)
  ).resolves.not.toThrow();
});

it("should not throw on valid PCR+SER v2 document", async () => {
  whenFragmentsAreValid();
  await expect(
    validateV2Document(examplePcrSerHealthCertV2Wrapped)
  ).resolves.not.toThrow();
});

it("should not throw on valid LAMP v2 document", async () => {
  whenFragmentsAreValid();
  await expect(
    validateV2Document(exampleLampHealthCertV2Wrapped)
  ).resolves.not.toThrow();
});

it("should throw on v2 document failing when pass v1 document data", async () => {
  whenFragmentsAreValid();
  await expect(
    validateV2Document(examplePcrHealthCertV1Wrapped)
  ).rejects.toThrow(
    'Document should include a valid "version" attribute (e.g. "pdt-healthcert-v2.0")'
  );
});

it("should throw on v2 document failing when document data id string invalid", async () => {
  const sampleDocumentV2InvalidId = {
    version: "https://schema.openattestation.com/2.0/schema.json",
    data: {
      id: 123456,
    },
  } as any;
  await expect(validateV2Document(sampleDocumentV2InvalidId)).rejects.toThrow(
    'Document should include a valid "id" in string (e.g. "00738c55-0af8-472d-b346-4af39155b8e3")'
  );
});

it("should throw on v2 document failing when document data version invalid", async () => {
  const sampleDocumentV2InvalidVersion = {
    version: "https://schema.openattestation.com/2.0/schema.json",
    data: {
      id: "5981af19-fe9f-43c1-9f31-9ccb9a1fcbd2:string:76caf3f9-5591-4ef1-b756-1cb47a76dede",
      version:
        "a9c30f4a-d12a-444f-b129-169f4151f9b8:string:invalid-healthcert-v2.0",
    },
  } as any;
  await expect(
    validateV2Document(sampleDocumentV2InvalidVersion)
  ).rejects.toThrow(
    'Document should include a valid "version" attribute (e.g. "pdt-healthcert-v2.0")'
  );
});

it("should throw on v2 document failing when document data validFrom invalid", async () => {
  const sampleDocumentV2InvalidValidFrom = {
    version: "https://schema.openattestation.com/2.0/schema.json",
    data: {
      id: "5981af19-fe9f-43c1-9f31-9ccb9a1fcbd2:string:76caf3f9-5591-4ef1-b756-1cb47a76dede",
      version:
        "a9c30f4a-d12a-444f-b129-169f4151f9b8:string:pdt-healthcert-v2.0",
      validFrom:
        "9a3aee04-5ff2-4a8a-8407-863dd951a7ef:string:18-05-2021T06:43:12.152Z",
    },
  } as any;
  await expect(
    validateV2Document(sampleDocumentV2InvalidValidFrom)
  ).rejects.toThrow(
    'Document should include a valid "validFrom" attribute in ISO 8601 datetime value (e.g. "2021-08-18T05:13:53.378Z" or "2021-10-25T00:00:00+08:00")'
  );
});

it("should throw on v2 document failing when document data fhirVersion invalid", async () => {
  const sampleDocumentV2InvalidFhirVersion = {
    version: "https://schema.openattestation.com/2.0/schema.json",
    data: {
      id: "5981af19-fe9f-43c1-9f31-9ccb9a1fcbd2:string:76caf3f9-5591-4ef1-b756-1cb47a76dede",
      version:
        "a9c30f4a-d12a-444f-b129-169f4151f9b8:string:pdt-healthcert-v2.0",
      validFrom:
        "9a3aee04-5ff2-4a8a-8407-863dd951a7ef:string:2021-05-18T06:43:12.152Z",
      fhirVersion: "e68b58fd-318e-4c5b-88ed-06b52c2247bc:string:0.0.1",
    },
  } as any;
  await expect(
    validateV2Document(sampleDocumentV2InvalidFhirVersion)
  ).rejects.toThrow(
    'Document should include a valid "fhirVersion" attribute (e.g. "4.0.1")'
  );
});

it("should throw on v2 document failing when document data type invalid", async () => {
  const sampleDocumentV2InvalidType = {
    version: "https://schema.openattestation.com/2.0/schema.json",
    data: {
      id: "5981af19-fe9f-43c1-9f31-9ccb9a1fcbd2:string:76caf3f9-5591-4ef1-b756-1cb47a76dede",
      version:
        "a9c30f4a-d12a-444f-b129-169f4151f9b8:string:pdt-healthcert-v2.0",
      validFrom:
        "9a3aee04-5ff2-4a8a-8407-863dd951a7ef:string:2021-05-18T06:43:12.152Z",
      fhirVersion: "e68b58fd-318e-4c5b-88ed-06b52c2247bc:string:4.0.1",
      type: "a60dd179-4029-44c5-8b77-296b10412836:string:Other",
    },
  } as any;
  await expect(validateV2Document(sampleDocumentV2InvalidType)).rejects.toThrow(
    `Document type of "Other" is invalid. Only "PCR", "ART", "SER" or "LAMP" is supported`
  );
});

describe("document logo validation", () => {
  const GENERIC_LOGO_ERROR = `Submitted HealthCert is invalid as document should include a valid "logo" attribute in base64 image string or HTTPS direct link (i.e. /(^data:image\\/(png|jpg|jpeg);base64,.*$)|(^https:\\/\\/.*[.](png|jpg|jpeg)$)/)`;

  it("should not throw on valid base64 image string", async () => {
    whenFragmentsAreValid();
    await expect(
      validateV2Document(examplePcrHealthCertV2Wrapped)
    ).resolves.not.toThrow();
  });

  it("should not throw on valid https url", async () => {
    const sampleDocumentV2ValidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2ValidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:https://www.notarise.gov.sg/images/notarise-logo.png";

    whenFragmentsAreValid();
    await expect(
      validateV2Document(examplePcrHealthCertV2Wrapped)
    ).resolves.not.toThrow();
  });

  it("should throw on invalid string", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:foobar";

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { message: e.message };
      }
    }
    expect(thrownError).toStrictEqual({
      message: GENERIC_LOGO_ERROR,
    });
  });

  it("should throw on invalid base64 image string", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:data:image/png;base64,foobar";

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { title: e.message, body: e.details };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Document "logo" should resolve to a valid base64 image string (i.e. png|jpg|jpeg)`,
      body: `Unable to validate document - (!VALID_MIME_PATTERN.test(base64FileType?.mime || ""))`,
    });
  });

  it("should throw on large base64 image string (>21KB)", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo = `a60dd179-4029-44c5-8b77-296b10412836:string:${mockImage["33KB"]}`;

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { title: e.message };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Document "logo" in base64 image string is too large (33.95KB). Only <=21KB is supported.`,
    });
  });

  it("should throw on https url with unknown format", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:http://example.com/image.foo";

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { message: e.message };
      }
    }
    expect(thrownError).toStrictEqual({
      message: GENERIC_LOGO_ERROR,
    });
  });

  it("should throw on https url with no direct link", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:http://example.com/image";

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { message: e.message };
      }
    }
    expect(thrownError).toStrictEqual({
      message: GENERIC_LOGO_ERROR,
    });
  });

  it("should throw on https url that is unresolvable", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:https://foobar.notarise/unknown.png";

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { title: e.message };
      }
    }
    expect(thrownError).toStrictEqual({
      title:
        'Submitted HealthCert is invalid - Document "logo" should resolve to a valid HTTPS direct link (i.e. png|jpg|jpeg)',
    });
  });

  it("should throw on http url that is insecure", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo =
      "a60dd179-4029-44c5-8b77-296b10412836:string:http://example.com/image.png";

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = { message: e.message };
      }
    }
    expect(thrownError).toStrictEqual({
      message: GENERIC_LOGO_ERROR,
    });
  });
});
