import { WrappedDocument } from "@govtechsg/open-attestation";
import { validateDocument, validateV2Document } from "./validateDocument";
import { HealthCertDocument } from "../../../types";

export const validateInputs = async (
  attachment: WrappedDocument<HealthCertDocument>
) => Promise.all([validateDocument(attachment)]);

export const validateV2Inputs = async (
  attachment: WrappedDocument<HealthCertDocument>
) => Promise.all([validateV2Document(attachment)]);
