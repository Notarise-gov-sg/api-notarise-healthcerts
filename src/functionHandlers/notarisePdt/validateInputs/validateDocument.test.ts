import { verify, isValid } from "@govtechsg/oa-verify";
import exampleHealthcertWrapped from "../../../../test/fixtures/example_healthcert_with_nric_wrapped.json";
import { validateDocument } from "./validateDocument";

jest.mock("@govtechsg/oa-verify");

const mockVerify = verify as jest.Mock;
const mockIsValid = isValid as jest.Mock;

const sampleDocument = exampleHealthcertWrapped as any;

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
};

beforeEach(() => {
  mockVerify.mockReset();
  mockIsValid.mockReset();
  whenFragmentsAreValid();
});

it("should not throw on valid document", async () => {
  whenFragmentsAreValid();
  await expect(validateDocument(sampleDocument)).resolves.not.toThrow();
});

it("should throw on document failing OA verification", async () => {
  mockIsValid.mockReturnValue(false);
  await expect(validateDocument(sampleDocument)).rejects.toThrow(
    /Invalid document error/
  );
});

it("should throw on document with multiple issuer identity passing (should not happen)", async () => {
  mockVerify.mockResolvedValue([
    ...validFragments,
    {
      name: "ADDITIONAL",
      type: "ISSUER_IDENTITY",
      data: {},
      status: "VALID",
    },
  ]);
  await expect(validateDocument(sampleDocument)).rejects.toThrow(
    /Invalid document error/
  );
});

it("should throw on document with multiple issuers", async () => {
  mockVerify.mockResolvedValue([
    {
      name: "OpenAttestationDnsDid",
      type: "ISSUER_IDENTITY",
      data: [
        {
          location: "donotverify.testing.verify.gov.sg",
          key: "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830#controller",
          status: "VALID",
        },
        {
          location: "donotverify2.testing.verify.gov.sg",
          key: "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B831#controller",
          status: "VALID",
        },
      ],
      status: "VALID",
    },
  ]);
  await expect(validateDocument(sampleDocument)).rejects.toThrow(
    /Invalid document error/
  );
});

it("should throw on document without issuer domain name (should not happen)", async () => {
  mockVerify.mockResolvedValue([
    {
      name: "OpenAttestationDnsDid",
      type: "ISSUER_IDENTITY",
      data: [
        {
          key: "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830#controller",
          status: "VALID",
        },
      ],
      status: "VALID",
    },
  ]);
  await expect(validateDocument(sampleDocument)).rejects.toThrow(
    /Invalid document error/
  );
});

it("should throw on document with unauthorized issuer domain", async () => {
  const unauthorizedIssuerDomain = "unauthorized.gov.sg";
  mockVerify.mockResolvedValue([
    {
      name: "OpenAttestationDnsDid",
      type: "ISSUER_IDENTITY",
      data: [
        {
          location: unauthorizedIssuerDomain,
          key: "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830#controller",
          status: "VALID",
        },
      ],
      status: "VALID",
    },
  ]);
  await expect(validateDocument(sampleDocument)).rejects.toThrow(
    /Unrecognised clinic error/
  );
});
