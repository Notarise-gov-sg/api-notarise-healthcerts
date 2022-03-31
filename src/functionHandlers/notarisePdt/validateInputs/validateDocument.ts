import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  isValid,
  openAttestationVerifiers,
  verificationBuilder,
  VerificationFragment,
  verify as defaultVerify,
} from "@govtechsg/oa-verify";
import { WrappedDocument, getData } from "@govtechsg/open-attestation";
import {
  pdtHealthCertV2,
  pdtHealthCertV2Schema,
  fhirSchema,
} from "@govtechsg/oa-schemata";
import _ from "lodash";
import axios from "axios";
import { fromStream, fromBuffer } from "file-type";
import { serializeError } from "serialize-error";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { PDTHealthCertV2 } from "../../../types";
import { config } from "../../../config";
import { CodedError } from "../../../common/error";
import OpenAttestationV2Schema from "../../../static/schema/schema.json"; // it's same with `{SchemaId.v2} from "@govtechsg/open-attestation"` schema but we want to load it locally, instead of loading it from http request.

const ajv = new Ajv({
  allErrors: true,
  schemas: [
    pdtHealthCertV2Schema.clinicProviderSchema,
    OpenAttestationV2Schema,
    pdtHealthCertV2Schema.schema,
    fhirSchema.liteFhirSchema,
  ],
}).addVocabulary(["deprecationMessage"]);
addFormats(ajv);

export const validateV2Document = async (
  wrappedDocument: WrappedDocument<PDTHealthCertV2>
) => {
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

    /* 2. Validate against PDT Schema v2.0 */
    const data = getData(wrappedDocument);
    const validator = ajv.getSchema(
      "https://schemata.openattestation.com/sg/gov/moh/pdt-healthcert/2.0/clinic-provider-schema.json"
    );
    if (validator && !validator(data)) {
      throw new CodedError(
        "INVALID_DOCUMENT",
        `The following required fields are missing: ${JSON.stringify(
          _.uniqWith(validator.errors, _.isEqual)
        )}. For more info, refer to the mapping table here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`
      );
    }

    const { PdtTypes } = pdtHealthCertV2;
    /* 3. Check against issuer domain whitelist [api-authorized-issuers] */
    const issuerDomain: string | undefined = issuer.data[0]?.location;
    if (!issuerDomain)
      throw new CodedError("INVALID_DOCUMENT", `Issuer's domain is not found`);

    const whitelistType =
      _.isString(data.type) && data.type === PdtTypes.Art
        ? PdtTypes.Art // Only when HealthCert is a single type `"ART"`, check against ART whitelist
        : PdtTypes.Pcr; // Else, default to PCR whitelist for all other types (e.g. `"PCR"`, `"SER"`, `"LAMP"`, `["PCR", "SER"]`)

    const validDomain = await isAuthorizedIssuer(issuerDomain, whitelistType);
    if (!validDomain)
      throw new CodedError(
        "UNRECOGNISED_CLINIC",
        "The HealthCert was not issued by a clinic recognised by the Ministry of Health Singapore",
        `Submitted HealthCert not a recognised/whitelisted clinic - ${issuerDomain} (${JSON.stringify(
          data.type
        )})`
      );

    /* 4. Validate logo (<=20KB base64 image string or HTTPS direct link) */
    if (data.logo) {
      const VALID_LOGO_PATTERN =
        // Either base64 string or https URL in .png | .jpg | .jpeg format
        /(^data:image\/(png|jpg|jpeg);base64,.*$)|(^https:\/\/.*[.](png|jpg|jpeg)$)/;
      const VALID_MIME_PATTERN = /^image\/(png|jpeg)$/;
      const MAX_LOGO_SIZE_IN_KILOBYTES = 21 * 1024; // 20KB (21KB) for some leeway

      if (!VALID_LOGO_PATTERN.test(data.logo)) {
        throw new CodedError(
          "INVALID_DOCUMENT",
          `Submitted HealthCert is invalid as document should include a valid "logo" attribute in base64 image string or HTTPS direct link (i.e. ${VALID_LOGO_PATTERN})`
        );
      }

      if (data.logo.startsWith("https://")) {
        try {
          const res = await axios.get(data.logo, { responseType: "stream" });
          const httpsFileType = await fromStream(res.data);
          if (!VALID_MIME_PATTERN.test(httpsFileType?.mime || "")) {
            throw new CodedError(
              "INVALID_DOCUMENT",
              `Submitted HealthCert is invalid - Document "logo" should resolve to a valid HTTPS direct link (i.e. png|jpg|jpeg)`
            );
          }
        } catch (e) {
          throw e instanceof CodedError
            ? e
            : new CodedError(
                "UNKNOWN_ERROR",
                `Submitted HealthCert is invalid - Document "logo" should resolve to a valid HTTPS direct link (i.e. png|jpg|jpeg)`,
                JSON.stringify(serializeError(e))
              );
        }
      } else if (data.logo.startsWith("data:image")) {
        const buffer = Buffer.from(data.logo.split(",")[1], "base64");
        const base64FileType = await fromBuffer(buffer);

        if (!VALID_MIME_PATTERN.test(base64FileType?.mime || "")) {
          throw new CodedError(
            "INVALID_LOGO",
            `Document "logo" should resolve to a valid base64 image string (i.e. png|jpg|jpeg)`,
            `Unable to validate document - (!VALID_MIME_PATTERN.test(base64FileType?.mime || ""))`
          );
        }

        if (data.logo.startsWith("data:")) {
          const byteLength = Buffer.byteLength(data.logo, "utf-8");
          if (byteLength >= MAX_LOGO_SIZE_IN_KILOBYTES) {
            throw new CodedError(
              "INVALID_LOGO",
              `Document "logo" in base64 image string is too large (${(
                byteLength / 1024
              ).toFixed(2)}KB). Only <=${
                MAX_LOGO_SIZE_IN_KILOBYTES / 1024
              }KB is supported.`
            );
          }
        }
      }
    }
  } catch (e) {
    throw e instanceof CodedError
      ? e
      : new CodedError(
          "UNKNOWN_ERROR",
          `Unable to validate document`,
          JSON.stringify(serializeError(e))
        );
  }
};
