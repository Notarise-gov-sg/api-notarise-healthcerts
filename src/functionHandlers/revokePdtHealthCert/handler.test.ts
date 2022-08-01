import axios from "axios";
import { main } from "./handler";
import pdtPcrNotarizedWithNricUnwrapped from "../../../test/fixtures/v2/pdt_pcr_notarized_with_nric_unwrapped.json";
import pdtPcrNotarizedWithOcspValid from "../../../test/fixtures/v2/pdt_pcr_notarized_with_ocsp_valid.json";
import pdtPcrNotarizedWithNricWrapped from "../../../test/fixtures/v2/pdt_pcr_notarized_with_nric_wrapped.json";

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

describe("revokePdtHealthCert", () => {
  it("should fail if document is missing", async () => {
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
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      'Unable to validate document as document is invalid: [{"status":"SKIPPED","type":"DOCUMENT_INTEGRITY","name":"OpenAttestationHash","reason":{"code":2,"codeString":"SKIPPED","message":"Document does not have merkle root, target hash or data."}},{"status":"SKIPPED","type":"DOCUMENT_STATUS","name":"OpenAttestationEthereumTokenRegistryStatus","reason":{"code":4,"codeString":"SKIPPED","message":"Document issuers doesn\'t have \\"tokenRegistry\\" property or TOKEN_REGISTRY method"}},{"status":"SKIPPED","type":"DOCUMENT_STATUS","name":"OpenAttestationEthereumDocumentStoreStatus","reason":{"code":4,"codeString":"SKIPPED","message":"Document issuers doesn\'t have \\"documentStore\\" or \\"certificateStore\\" property or DOCUMENT_STORE method"}},{"status":"SKIPPED","type":"DOCUMENT_STATUS","name":"OpenAttestationDidSignedDocumentStatus","reason":{"code":0,"codeString":"SKIPPED","message":"Document was not signed by DID directly"}},{"status":"SKIPPED","type":"ISSUER_IDENTITY","name":"OpenAttestationDnsTxtIdentityProof","reason":{"code":2,"codeString":"SKIPPED","message":"Document issuers doesn\'t have \\"documentStore\\" / \\"tokenRegistry\\" property or doesn\'t use DNS-TXT type"}},{"status":"SKIPPED","type":"ISSUER_IDENTITY","name":"OpenAttestationDnsDidIdentityProof","reason":{"code":0,"codeString":"SKIPPED","message":"Document was not issued using DNS-DID"}}]'
    );
  });

  it("should fail if document is unwrapped", async () => {
    const result = await main(
      {
        body: pdtPcrNotarizedWithNricUnwrapped,
        headers: {},
        requestContext: { identity: { apiKeyId: "" } },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 400);
    expect(JSON.parse(result.body)).toHaveProperty("type", "INVALID_DOCUMENT");
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      'Unable to validate document as document is invalid: [{"status":"SKIPPED","type":"DOCUMENT_INTEGRITY","name":"OpenAttestationHash","reason":{"code":2,"codeString":"SKIPPED","message":"Document does not have merkle root, target hash or data."}},{"status":"SKIPPED","type":"DOCUMENT_STATUS","name":"OpenAttestationEthereumTokenRegistryStatus","reason":{"code":4,"codeString":"SKIPPED","message":"Document issuers doesn\'t have \\"tokenRegistry\\" property or TOKEN_REGISTRY method"}},{"status":"SKIPPED","type":"DOCUMENT_STATUS","name":"OpenAttestationEthereumDocumentStoreStatus","reason":{"code":4,"codeString":"SKIPPED","message":"Document issuers doesn\'t have \\"documentStore\\" or \\"certificateStore\\" property or DOCUMENT_STORE method"}},{"status":"SKIPPED","type":"DOCUMENT_STATUS","name":"OpenAttestationDidSignedDocumentStatus","reason":{"code":0,"codeString":"SKIPPED","message":"Document was not signed by DID directly"}},{"status":"SKIPPED","type":"ISSUER_IDENTITY","name":"OpenAttestationDnsTxtIdentityProof","reason":{"code":2,"codeString":"SKIPPED","message":"Document issuers doesn\'t have \\"documentStore\\" / \\"tokenRegistry\\" property or doesn\'t use DNS-TXT type"}},{"status":"SKIPPED","type":"ISSUER_IDENTITY","name":"OpenAttestationDnsDidIdentityProof","reason":{"code":0,"codeString":"SKIPPED","message":"Document was not issued using DNS-DID"}}]'
    );
  });

  it("should fail if caller provides does not provide clinic API key", async () => {
    const result = await main(
      {
        body: pdtPcrNotarizedWithOcspValid,
        headers: {},
        requestContext: { identity: {} },
      },
      {} as any,
      () => undefined
    );

    expect(JSON.parse(result.body)).toHaveProperty("statusCode", 400);
    expect(JSON.parse(result.body)).toHaveProperty(
      "type",
      "MISSING_CLINIC_API_KEY"
    );
    expect(JSON.parse(result.body)).toHaveProperty(
      "message",
      "Unable to revoke certificate - missing clinic API key"
    );
  });

  it("should fail if caller provides invalid clinic API key", async () => {
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
    jest.spyOn(axios, "post").mockResolvedValueOnce({
      data: {
        success: true,
        documentHash:
          "02040268f6f77bbc8d86797b49fc8193d827825644b715d68a37ac5deb2ff05b",
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
          "02040268f6f77bbc8d86797b49fc8193d827825644b715d68a37ac5deb2ff05b",
        message: "documentHash inserted into revocation table",
      })
    );
  });
});
