import { wrapDocument, WrappedDocument } from "@govtechsg/open-attestation";
import {
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/oa-did-sign";
import {
  HealthCertDocument,
  NotarizedHealthCert,
  SignedNotarizedHealthCert,
} from "../../../types";
import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import { config } from "../../../config";
import { getLogger } from "../../../common/logger";

const { didSigner } = config;
const { trace } = getLogger("src/models/notarizedHealthCert/createNotarizedHealthCert/createNotarizedHealthCert.ts");


const signWrappedDocument = (
  wrappedDocument: WrappedDocument<NotarizedHealthCert>
) =>
  signDocument(
    wrappedDocument,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    didSigner.key,
    didSigner.privateKey
  ) as Promise<SignedNotarizedHealthCert>;

export const createNotarizedHealthCert = async (
  certificate: WrappedDocument<HealthCertDocument>,
  reference: string,
  storedUrl: string
) => {
  const unwrappedNotarisedDocument = createUnwrappedDocument(
    certificate,
    reference,
    storedUrl
  );
  const wrappedNotarisedDocument = wrapDocument(unwrappedNotarisedDocument);
  const traceWithRef = trace.extend("reference");
  traceWithRef("Document successfully notarized");
  return signWrappedDocument(wrappedNotarisedDocument);
};
