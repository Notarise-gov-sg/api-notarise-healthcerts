import axios from "axios";
import { verify, isValid } from "@govtechsg/oa-verify";
import { main } from "./handler";
import pdtPcrNotarizedWithOcspValid from "../../../test/fixtures/v2/pdt_pcr_notarized_with_ocsp_valid.json";
import pdtPcrNotarizedWithNricWrapped from "../../../test/fixtures/v2/pdt_pcr_notarized_with_nric_wrapped.json";
import { isAuthorizedIssuer } from "../notarisePdt/authorizedIssuers";

jest.mock("../../static/provider_apikeyid.merged.json", () => [
  {
    id: "foobar1",
    name: "stg-notariseHealthcertKey-donotverify",
    domain: "donotverify.testing.verify.gov.sg",
  },
  {
    id: "foobar2",
    name: "stg-notariseHealthcertKey-HelloWorld12",
    domain: "dummy.domain.com",
  },
  {
    id: "testnodomain",
    name: "stg-notariseHealthcertKey-IGotNoDomain",
  },
]);

jest.mock("@govtechsg/oa-verify");

const mockVerify = verify as jest.Mock;
const mockIsValid = isValid as jest.Mock;

jest.mock("../notarisePdt/authorizedIssuers");
const mockIsAuthorizedIssuer = isAuthorizedIssuer as jest.Mock;

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

describe("revokePdtHealthCert", () => {
  beforeEach(() => {
    mockVerify.mockReset();
    mockIsValid.mockReset();
    mockIsAuthorizedIssuer.mockReset();
  });

  it("should fail if document fails verify", async () => {
    const result = await main(
      {
        body: {},
        headers: {},
        requestContext: { identity: { apiKeyId: "" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 400);
    expect(JSON.parse(result.body)).toHaveProperty("type", "INVALID_DOCUMENT");
    expect(result.body).toMatch(
      /(Unable to validate document as document is invalid:)/i
    );
  });

  it("should fail if caller provides invalid API key", async () => {
    whenFragmentsAreValid();

    const result = await main(
      {
        body: pdtPcrNotarizedWithOcspValid,
        headers: {},
        requestContext: { identity: { apiKeyId: "dummy" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 400);
    expect(JSON.parse(result.body)).toHaveProperty("type", "INVALID_API_KEY");
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      "Unable to revoke certificate - key is invalid"
    );
  });

  it("should fail if caller provides valid clinic API key but does not have a mapped domain", async () => {
    whenFragmentsAreValid();

    const result = await main(
      {
        body: pdtPcrNotarizedWithOcspValid,
        headers: {},
        requestContext: { identity: { apiKeyId: "testnodomain" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 500);
    expect(JSON.parse(result.body)).toHaveProperty(
      "type",
      "MISSING_CLINIC_DOMAIN_ERROR"
    );
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      "Unable to revoke certificate - unable to find domain"
    );
  });

  it("should fail if caller domain does not match pre-endorsed healthcert's domain", async () => {
    whenFragmentsAreValid();

    const result = await main(
      {
        body: pdtPcrNotarizedWithOcspValid,
        headers: {},
        requestContext: { identity: { apiKeyId: "foobar2" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 400);
    expect(JSON.parse(result.body)).toHaveProperty("type", "INVALID_PROVIDER");
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      "Unable to revoke certificate - caller clinic must match provider clinic in certificate"
    );
  });

  it("should fail if document does not have valid revocation field", async () => {
    whenFragmentsAreValid();

    const result = await main(
      {
        body: pdtPcrNotarizedWithNricWrapped,
        headers: {},
        requestContext: { identity: { apiKeyId: "foobar1" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 400);
    expect(JSON.parse(result.body)).toHaveProperty("type", "INVALID_DOCUMENT");
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      "Unable to revoke certificate - revocation fields missing in certificate"
    );
  });

  it("should revoke cert when validation passes", async () => {
    whenFragmentsAreValid();

    jest.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        success: true,
        documentHash:
          "0x02040268f6f77bbc8d86797b49fc8193d827825644b715d68a37ac5deb2ff05b",
        message: "documentHash inserted into revocation table",
      },
    });

    const result = await main(
      {
        body: pdtPcrNotarizedWithOcspValid,
        headers: {},
        requestContext: { identity: { apiKeyId: "foobar1" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(JSON.stringify(result.body))).toBe(
      JSON.stringify({
        success: true,
        documentHash:
          "0x02040268f6f77bbc8d86797b49fc8193d827825644b715d68a37ac5deb2ff05b",
        message: "documentHash inserted into revocation table",
      })
    );
  });
});
