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
import axios from "axios";
import { fromStream, fromBuffer } from "file-type";
import { serializeError } from "serialize-error";
import { isAuthorizedIssuer } from "../authorizedIssuers";
import { PDTHealthCertV2 } from "../../../types";
import { config } from "../../../config";
import { CodedError } from "../../../common/error";

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
    if (!data.id || typeof data.id !== "string")
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Document should include a valid "id" in string (e.g. "00738c55-0af8-472d-b346-4af39155b8e3")`,
        `Unable to validate document - (!data.id || typeof data.id !== "string")`
      );

    if (!data.version || !data.version.match(/(pdt-healthcert-v2.0)$/))
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Document should include a valid "version" attribute (e.g. "pdt-healthcert-v2.0")`,
        `Unable to validate document - (!data.version || !data.version.match(/(pdt-healthcert-v2.0)$/))`
      );

    // validate `validFrom` to be valid ISO 8601 date time (e.g. "2021-08-18T05:13:53.378Z" or "2021-10-25T00:00:00+08:00")
    if (
      !data.validFrom ||
      !data.validFrom.match(
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+|-]\d{2}:\d{2})$/
      )
    )
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Document should include a valid "validFrom" attribute in ISO 8601 datetime value (e.g. "2021-08-18T05:13:53.378Z" or "2021-10-25T00:00:00+08:00")`
      );

    if (!data.fhirVersion || !data.fhirVersion.match(/(4.0.1)$/))
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Document should include a valid "fhirVersion" attribute (e.g. "4.0.1")`
      );

    if (!data.type)
      throw new CodedError(
        "INVALID_DOCUMENT",
        `Document should include a valid "type" attribute (e.g. "PCR", "ART", "SER" or ["PCR", "SER"])`
      );

    const { PdtTypes } = pdtHealthCertV2;
    if (_.isString(data.type)) {
      // When document is a single type (i.e. Just "PCR" | "ART" | "SER"| "LAMP")
      const supportedSingleTypes = [
        PdtTypes.Pcr,
        PdtTypes.Art,
        PdtTypes.Ser,
        PdtTypes.Lamp,
      ];
      const isValidSingleType = supportedSingleTypes.some(
        (t) => t === data.type
      );

      if (!isValidSingleType)
        throw new CodedError(
          "INVALID_DOCUMENT",
          `Document type of "${data.type}" is invalid. Only "PCR", "ART", "SER" or "LAMP" is supported`
        );
    } else {
      // When document is a multi type (i.e. ["PCR", "SER"])
      const supportedMultiTypes = [[PdtTypes.Pcr, PdtTypes.Ser]]; // For now, only ["PCR", "SER"] is supported
      const isValidMultiType = supportedMultiTypes.some((t) =>
        // Sort each multi type before comparing array equality
        _.isEqual(_.sortBy(t), _.sortBy(data.type))
      );

      if (!isValidMultiType)
        throw new CodedError(
          "INVALID_DOCUMENT",
          `Document type of ${JSON.stringify(
            data.type
          )} is invalid. Only ${supportedMultiTypes.map((mt) =>
            JSON.stringify(mt)
          )} is supported.`
        );
    }

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
