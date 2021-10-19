import { WrappedDocument } from "@govtechsg/open-attestation";
import { validateDocument, validateV2Document } from "./validateDocument";
import { HealthCertDocument, PDTHealthCertV2Document } from "../../../types";

/**
 * @deprecated This function should be removed when PDT HealthCert v1.0 is deprecated.
 */
export const validateInputs = async (
  attachment: WrappedDocument<HealthCertDocument>
) => Promise.all([validateDocument(attachment)]);

export const validateV2Inputs = async (
  wrappedDocument: WrappedDocument<PDTHealthCertV2Document>
) => Promise.all([validateV2Document(wrappedDocument)]);
