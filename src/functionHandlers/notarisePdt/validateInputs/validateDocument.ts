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
  if (!attachment.data?.version)
    throw new DocumentInvalidError(
      "Document should include 'version' attribute"
    );
  const documentType = (attachment.data?.type ?? "").toLowerCase();
  if (!attachment.data?.type || !documentType.match(/(pcr|art)$/))
    throw new DocumentInvalidError("Document should include 'type' attribute");
  validateDocument(attachment);
};
