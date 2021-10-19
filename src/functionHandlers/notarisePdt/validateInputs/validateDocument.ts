import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
  VerificationFragment,
  verify as defaultVerify,
} from "@govtechsg/oa-verify";
import { WrappedDocument, getData } from "@govtechsg/open-attestation";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import _ from "lodash";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { HealthCertDocument, PDTHealthCertV2Document } from "../../../types";
import {
  UnrecognisedClinicError,
  DocumentInvalidError,
} from "../../../common/error";
import { config } from "../../../config";

/**
 * @deprecated This function should be removed when PDT HealthCert v1.0 is deprecated.
 */
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
  wrappedDocument: WrappedDocument<PDTHealthCertV2Document>
) => {
  /* 1. Verify and validate against Open Attestation */
  const verify =
    verificationBuilder(openAttestationVerifiers, {
      network: config.network,
    }) ?? defaultVerify;

  const results = await verify(wrappedDocument);
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

  /* 2. Validate against PDT Schema v2.0 */
  const data = getData(wrappedDocument);
  if (!data.id || typeof data.id !== "string")
    throw new DocumentInvalidError(
      `Document should include a valid "id" in string (e.g. "00738c55-0af8-472d-b346-4af39155b8e3")`
    );

  if (!data.version || !data.version.match(/(pdt-healthcert-v2.0)$/))
    throw new DocumentInvalidError(
      `Document should include a valid "version" attribute (e.g. "pdt-healthcert-v2.0")`
    );

  // validate `validFrom` to be valid ISO 8601 date time (e.g. 2021-08-18T05:13:53.378Z)
  if (
    !data.validFrom ||
    !data.validFrom.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)$/)
  )
    throw new DocumentInvalidError(
      `Document should include a valid "validFrom" attribute in ISO 8601 datetime value (e.g. "2021-08-18T05:13:53.378Z")`
    );

  if (!data.fhirVersion || !data.fhirVersion.match(/(4.0.1)$/))
    throw new DocumentInvalidError(
      `Document should include a valid "fhirVersion" attribute (e.g. "4.0.1")`
    );

  if (!data.type)
    throw new DocumentInvalidError(
      `Document should include a valid "type" attribute (e.g. "PCR", "ART", "SER", ["PCR", "SER"]`
    );

  const { PdtTypes } = pdtHealthCertV2;
  if (_.isString(data.type)) {
    // When document is a single type (i.e. Just "PCR" | "ART" | "SER")
    const supportedTypes = [PdtTypes.Pcr, PdtTypes.Art, PdtTypes.Ser];
    const isValidType = supportedTypes.some((t) => t === data.type);

    if (!isValidType)
      throw new DocumentInvalidError(
        `Document type of "${data.type}" is invalid. Only "PCR", "ART" or "SER" is supported`
      );
  } else {
    // When document is a multi type (i.e. ["PCR", "SER"])
    const supportedMultiType = [PdtTypes.Pcr, PdtTypes.Ser]; // For now, only ["PCR", "SER"] is supported
    const isValidMultiType = _.isEqual(
      _.sortBy(supportedMultiType),
      _.sortBy(data.type)
    );

    if (!isValidMultiType)
      throw new DocumentInvalidError(
        `Document type of "${JSON.stringify(
          data.type
        )}" is invalid. Only "${JSON.stringify(
          supportedMultiType
        )}" is supported.`
      );
  }
};
