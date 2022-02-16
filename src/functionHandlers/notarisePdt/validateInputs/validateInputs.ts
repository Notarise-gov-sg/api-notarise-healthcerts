import { WrappedDocument } from "@govtechsg/open-attestation";
import { validateV2Document } from "./validateDocument";
import { PDTHealthCertV2 } from "../../../types";

export const validateV2Inputs = async (
  wrappedDocument: WrappedDocument<PDTHealthCertV2>
) => Promise.all([validateV2Document(wrappedDocument)]);
