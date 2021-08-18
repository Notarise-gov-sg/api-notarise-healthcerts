import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
  VerificationFragment,
  verify as defaultVerify,
} from "@govtechsg/oa-verify";
import { WrappedDocument } from "@govtechsg/open-attestation";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { HealthCertDocument } from "../../../types";
import {
  UnrecognisedClinicError,
  DocumentInvalidError,
} from "../../../common/error";
import { config } from "../../../config";

export const validateDocument = async (
  attachment: WrappedDocument<HealthCertDocument>
) => {
  const verify =
    verificationBuilder(openAttestationVerifiers, {
      network: config.network,
    }) ?? defaultVerify;

  const results = await verify(attachment);
  const documentIsValid = isValid(results);
  if (!documentIsValid) {
    throw new DocumentInvalidError(
      `validation error: ${JSON.stringify(results)}`
    );
  }
  const identityFragments = results.filter(
    (fragment) =>
      fragment.status === "VALID" && fragment.type === "ISSUER_IDENTITY"
  );
  if (identityFragments.length !== 1)
    throw new DocumentInvalidError(
      "Document may only have one issuer identity test"
    );

  type IdentityFragment = VerificationFragment & {
    data: any;
  };

  const issuer = identityFragments[0] as IdentityFragment;

  if (!issuer || issuer.data.length !== 1) {
    throw new DocumentInvalidError("Document may only have one issuer");
  }
  const issuerDomain: string | undefined = issuer.data[0]?.location;
  if (!issuerDomain)
    throw new DocumentInvalidError("Issuer's domain is not found");
  const validDomain = await isAuthorizedIssuer(issuerDomain);
  if (!validDomain) throw new UnrecognisedClinicError(issuerDomain);
};

export const validateV2Document = async (
  attachment: WrappedDocument<HealthCertDocument>
) => {
  if (!attachment.data?.id || typeof attachment.data?.id !== "string")
    throw new DocumentInvalidError(
      "Document should include `id` attribute with valid string value"
    );
  if (
    !attachment.data?.version ||
    !(attachment.data?.version).match(/(pdt-healthcert-v2.0)$/)
  )
    throw new DocumentInvalidError(
      "Document should include `version` attribute with valid `pdt-healthcert-v2.0` value"
    );
  // validate `validFrom` to be valid ISO 8601 date time (e.g. 2021-08-18T05:13:53.378Z)
  if (
    !attachment.data?.validFrom ||
    !(attachment.data?.validFrom).match(
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)$/
    )
  )
    throw new DocumentInvalidError(
      "Document should include `validFrom` attribute with valid ISO 8601 datetime value"
    );
  if (
    !attachment.data?.fhirVersion ||
    !(attachment.data?.fhirVersion).match(/(4.0.1)$/)
  )
    throw new DocumentInvalidError(
      "Document should include `fhirVersion` attribute with valid `4.0.1` value"
    );
  const documentType = (attachment.data?.type ?? "").toUpperCase();
  if (!attachment.data?.type || !documentType.match(/(PCR|ART)$/))
    throw new DocumentInvalidError("Document should include 'type' attribute");
  await validateDocument(attachment);
};
