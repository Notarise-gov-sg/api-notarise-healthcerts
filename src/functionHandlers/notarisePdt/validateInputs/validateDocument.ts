import { verify, isValid } from "@govtechsg/oa-verify";
import { WrappedDocument } from "@govtechsg/open-attestation";
import { config } from "../../../config";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { HealthCertDocument } from "../../../types";
import {
  UnrecognisedClinicError,
  DocumentInvalidError
} from "../../../common/error";

export const validateDocument = async (
  attachment: WrappedDocument<HealthCertDocument>
) => {
  const results = await verify(attachment, { network: config.network });
  const documentIsValid = isValid(results);
  if (!documentIsValid) {
    throw new DocumentInvalidError(
      `There was an error verifying the document: ${JSON.stringify(results)}`
    );
  }
  const identityFragment = results.filter(
    fragment =>
      fragment.status === "VALID" && fragment.type === "ISSUER_IDENTITY"
  );
  if (identityFragment.length !== 1)
    throw new DocumentInvalidError(
      "Document may only have one issuer identity"
    );
  const [issuer] = identityFragment;
  if (!issuer.data || !Array.isArray(issuer.data) || issuer.data.length !== 1)
    throw new DocumentInvalidError("Document may only have one issuer");
  const issuerDomain: string | undefined = issuer.data[0]?.location;
  if (!issuerDomain)
    throw new DocumentInvalidError("Issuer's domain is not found");
  if (!isAuthorizedIssuer(issuerDomain))
    throw new UnrecognisedClinicError(issuerDomain);
};
