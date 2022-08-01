import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { serializeError } from "serialize-error";
import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
  VerificationFragment,
  verify as defaultVerify,
} from "@govtechsg/oa-verify";
import { getLogger } from "../../common/logger";
import { PDTHealthCertV2 } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { config } from "../../config";
import { CodedError } from "../../common/error";
import { revokePdtHealthcert } from "./revokePdtHealthcert";
import { getProvider } from "./apiKeyMapping";

const { error } = getLogger("src/functionHandlers/revokePdtHealthcert/handler");

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<PDTHealthCertV2>>
): Promise<APIGatewayProxyResult> => {
  const reference = uuid();
  const wrappedDocument = event.body;
  const providerApiKey = event.requestContext.identity.apiKeyId;
  const errorWithRef = error.extend(`reference:${reference}`);

  try {
    try {
      /* 1. Verify and validate against Open Attestation */
      const verify =
        verificationBuilder(openAttestationVerifiers, {
          network: config.network,
        }) ?? defaultVerify;

      const results = await verify(wrappedDocument);
      const documentIsValid = isValid(results);
      if (!documentIsValid) {
        throw new CodedError(
          "INVALID_DOCUMENT",
          `Unable to validate document as document is invalid: ${JSON.stringify(
            results
          )}`
        );
      }
      const identityFragments = results.filter(
        (fragment) =>
          fragment.status === "VALID" && fragment.type === "ISSUER_IDENTITY"
      );
      if (identityFragments.length !== 1)
        throw new CodedError(
          "INVALID_DOCUMENT",
          "Unable to validate document - Document may only have one issuer identity test",
          `(identityFragments.length !== 1)`
        );

      type IdentityFragment = VerificationFragment & {
        data: any;
      };

      const issuer = identityFragments[0] as IdentityFragment;

      if (!issuer || issuer.data.length !== 1) {
        throw new CodedError(
          "INVALID_DOCUMENT",
          "Unable to validate document - Document may only have one issuer",
          `(!issuer || issuer.data.length !== 1)`
        );
      }
    } catch (e) {
      throw e instanceof CodedError
        ? e
        : new CodedError(
            "INVALID_DOCUMENT",
            "Error while verifying certificate",
            JSON.stringify(serializeError(e))
          );
    }

    /* 2. Ensure document has revocation.type and revocation.location */
    const data: PDTHealthCertV2 = getData(wrappedDocument);
    if (
      data.issuers[0].revocation?.type === undefined ||
      data.issuers[0].revocation?.location === undefined
    ) {
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Unable to revoke certificate - revocation fields missing in certificate`
      );
    }

    /* 3. Extract out clinic endorsed cert (attachment) from MOH endorsed cert (given) */
    const encodedPreEndorsedHealthcert = data.attachments
      ? data.attachments[0].data
      : undefined;

    if (encodedPreEndorsedHealthcert === undefined) {
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Unable to extract pre-endorsed HealthCert from given certificate`
      );
    }

    const decodedPreEndorsedHealthCert = Buffer.from(
      encodedPreEndorsedHealthcert,
      "base64"
    ).toString("ascii");

    const preEndorsedHealthCert = getData(
      JSON.parse(
        decodedPreEndorsedHealthCert
      ) as WrappedDocument<PDTHealthCertV2>
    );

    /* Revoke cert if caller is indeed the provider of the cert  */
    const healthCertClinicDomain =
      preEndorsedHealthCert.issuers[0].identityProof?.location;

    if (healthCertClinicDomain === undefined) {
      throw new CodedError(
        "INVALID_DOCUMENT",
        "Unable to revoke certificate - missing domain in identity proof"
      );
    }
    if (providerApiKey === undefined) {
      throw new CodedError(
        "MISSING_CLINIC_API_KEY",
        `Unable to revoke certificate - missing clinic API key`
      );
    }

    const caller =
      providerApiKey !== undefined ? getProvider(providerApiKey) : undefined;

    if (caller === undefined) {
      throw new CodedError(
        "INVALID_API_KEY",
        `Unable to revoke certificate - key is invalid`
      );
    }

    if (caller?.domain === undefined) {
      throw new CodedError(
        "MISSING_CLINIC_DOMAIN_ERROR",
        `Unable to revoke certificate - unable to find domain`
      );
    }

    if (!healthCertClinicDomain.includes(caller.domain)) {
      throw new CodedError(
        "INVALID_PROVIDER",
        `Unable to revoke certificate - caller clinic must match provider clinic in certificate`,
        `callerDomain !== clinicDomain`
      );
    }

    const res = await revokePdtHealthcert(reference, wrappedDocument);

    return {
      statusCode: 200,
      headers: {
        "x-trace-id": reference,
      },
      body: JSON.stringify(res),
    };
  } catch (e) {
    let codedError: CodedError;
    if (e instanceof CodedError) {
      codedError = e;
    } else {
      codedError = new CodedError(
        "UNKNOWN_ERROR",
        "Unable to revoke document",
        JSON.stringify(serializeError(e))
      );
    }

    errorWithRef(codedError.toString());
    return codedError.toResponse(reference);
  }
};

export const handler = middyfy(main);
