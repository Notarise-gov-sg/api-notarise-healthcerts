import { verify, isValid } from "@govtechsg/oa-verify";
import _examplePcrHealthCertV1Wrapped from "../../../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import _examplePcrHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";
import _exampleArtHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_art_with_nric_wrapped.json";
import _examplePcrSerHealthCertV2Wrapped from "../../../../test/fixtures/v2/pdt_pcr_ser_multi_result_wrapped.json";
import { validateV2Document } from "./validateDocument";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { DocumentInvalidError } from "../../../common/error";
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

it("should throw on v2 document failing when pass v1 document data", async () => {
  whenFragmentsAreValid();
  let thrownError;
  try {
    await validateV2Document(examplePcrHealthCertV1Wrapped);
  } catch (e) {
    if (e instanceof DocumentInvalidError) {
      thrownError = { title: e.title, body: e.messageBody };
    }
  }
  expect(thrownError).toStrictEqual({
    title: `Submitted HealthCert is invalid`,
    body: `The following required fields are missing: [{"instancePath":"","schemaPath":"#/required","keyword":"required","params":{"missingProperty":"version"},"message":"must have required property 'version'"},{"instancePath":"","schemaPath":"#/required","keyword":"required","params":{"missingProperty":"type"},"message":"must have required property 'type'"},{"instancePath":"/validFrom","schemaPath":"#/properties/validFrom/format","keyword":"format","params":{"format":"date-time"},"message":"must match format \\"date-time\\""},{"instancePath":"/fhirBundle/entry/0","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"resourceType"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/0","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"identifier"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/0","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"name"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/0","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"gender"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/0","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"birthDate"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/0/extension/0","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"code"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/1","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"resourceType"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/1","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"type"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/1","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"collection"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"resourceType"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"identifier"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"code"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"valueCodeableConcept"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"effectiveDateTime"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"status"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"performer"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/2","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"qualification"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/3","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"resourceType"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/3","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"name"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/3","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"type"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/3","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"endpoint"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/3","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"contact"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/4","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"resourceType"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/4","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"name"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/4","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"type"},"message":"must NOT have additional properties"},{"instancePath":"/fhirBundle/entry/4","schemaPath":"#/additionalProperties","keyword":"additionalProperties","params":{"additionalProperty":"contact"},"message":"must NOT have additional properties"}]. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
  });
});

it("should throw on v2 document failing when document data id string invalid", async () => {
  const sampleDocumentV2InvalidId = {
    ...examplePcrSerHealthCertV2Wrapped,
    data: {
      ...exampleArtHealthCertV2Wrapped.data,
      id: 123456,
    },
  } as any;
  let thrownError;
  try {
    await validateV2Document(sampleDocumentV2InvalidId);
  } catch (e) {
    if (e instanceof DocumentInvalidError) {
      thrownError = { title: e.title, body: e.messageBody };
    }
  }
  expect(thrownError).toStrictEqual({
    title: `Submitted HealthCert is invalid`,
    body: `The following required fields are missing: [{"instancePath":"/id","schemaPath":"#/properties/id/type","keyword":"type","params":{"type":"string"},"message":"must be string"}]. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
  });
});

it("should throw on v2 document failing when document data version invalid", async () => {
  const sampleDocumentV2InvalidVersion = {
    ...examplePcrSerHealthCertV2Wrapped,
    data: {
      ...exampleArtHealthCertV2Wrapped.data,
      version:
        "a9c30f4a-d12a-444f-b129-169f4151f9b8:string:invalid-healthcert-v2.0",
    },
  } as any;
  let thrownError;
  try {
    await validateV2Document(sampleDocumentV2InvalidVersion);
  } catch (e) {
    if (e instanceof DocumentInvalidError) {
      thrownError = { title: e.title, body: e.messageBody };
    }
  }
  expect(thrownError).toStrictEqual({
    title: `Submitted HealthCert is invalid`,
    body: `The following required fields are missing: [{"instancePath":"/version","schemaPath":"#/properties/version/enum","keyword":"enum","params":{"allowedValues":["pdt-healthcert-v2.0"]},"message":"must be equal to one of the allowed values"}]. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
  });
});

it("should throw on v2 document failing when document data validFrom invalid", async () => {
  const sampleDocumentV2InvalidValidFrom = {
    ...examplePcrSerHealthCertV2Wrapped,
    data: {
      ...exampleArtHealthCertV2Wrapped.data,
      validFrom:
        "9a3aee04-5ff2-4a8a-8407-863dd951a7ef:string:18-05-2021T06:43:12.152Z",
    },
  } as any;
  let thrownError;
  try {
    await validateV2Document(sampleDocumentV2InvalidValidFrom);
  } catch (e) {
    if (e instanceof DocumentInvalidError) {
      thrownError = { title: e.title, body: e.messageBody };
    }
  }
  expect(thrownError).toStrictEqual({
    title: `Submitted HealthCert is invalid`,
    body: `The following required fields are missing: [{"instancePath":"/validFrom","schemaPath":"#/properties/validFrom/format","keyword":"format","params":{"format":"date-time"},"message":"must match format \\"date-time\\""}]. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
  });
});

it("should throw on v2 document failing when document data type invalid", async () => {
  const sampleDocumentV2InvalidType = {
    ...examplePcrSerHealthCertV2Wrapped,
    data: {
      ...exampleArtHealthCertV2Wrapped.data,
      type: "a60dd179-4029-44c5-8b77-296b10412836:string:Other",
    },
  } as any;
  let thrownError;
  try {
    await validateV2Document(sampleDocumentV2InvalidType);
  } catch (e) {
    if (e instanceof DocumentInvalidError) {
      thrownError = { title: e.title, body: e.messageBody };
    }
  }
  expect(thrownError).toStrictEqual({
    title: `Submitted HealthCert is invalid`,
    body: `The following required fields are missing: [{"instancePath":"/type","schemaPath":"#/definitions/PdtTypes/enum","keyword":"enum","params":{"allowedValues":["PCR","ART","SER","LAMP"]},"message":"must be equal to one of the allowed values"},{"instancePath":"/type","schemaPath":"#/properties/type/oneOf/1/type","keyword":"type","params":{"type":"array"},"message":"must be array"},{"instancePath":"/type","schemaPath":"#/properties/type/oneOf","keyword":"oneOf","params":{"passingSchemas":null},"message":"must match exactly one schema in oneOf"}]. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
  });
});

describe("document logo validation", () => {
  const GENERIC_LOGO_ERROR = `Document should include a valid "logo" attribute in base64 image string or HTTPS direct link (i.e. /(^data:image\\/(png|jpg|jpeg);base64,.*$)|(^https:\\/\\/.*[.](png|jpg|jpeg)$)/)`;

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
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: GENERIC_LOGO_ERROR,
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
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: `Document "logo" should resolve to a valid base64 image string (i.e. png|jpg|jpeg)`,
    });
  });

  it("should throw on large base64 image string (>21KB)", async () => {
    const sampleDocumentV2InvalidLogo = { ...examplePcrHealthCertV2Wrapped };
    sampleDocumentV2InvalidLogo.data.logo = `a60dd179-4029-44c5-8b77-296b10412836:string:${mockImage["33KB"]}`;

    let thrownError;
    try {
      await validateV2Document(sampleDocumentV2InvalidLogo);
    } catch (e) {
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: `Document "logo" in base64 image string is too large (33.95KB). Only <=21KB is supported.`,
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
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: GENERIC_LOGO_ERROR,
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
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: GENERIC_LOGO_ERROR,
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
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: `Document "logo" should resolve to a valid HTTPS direct link (i.e. png|jpg|jpeg)`,
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
      if (e instanceof DocumentInvalidError) {
        thrownError = { title: e.title, body: e.messageBody };
      }
    }
    expect(thrownError).toStrictEqual({
      title: `Submitted HealthCert is invalid`,
      body: GENERIC_LOGO_ERROR,
    });
  });
});
