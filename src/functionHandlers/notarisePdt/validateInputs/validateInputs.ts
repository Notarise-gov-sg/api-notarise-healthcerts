import { WrappedDocument } from "@govtechsg/open-attestation";
import { validateDocument } from "./validateDocument";
import { HealthCertDocument } from "../../../types";

export const validateInputs = async (
  attachment: WrappedDocument<HealthCertDocument>
) => Promise.all([validateDocument(attachment)]);
