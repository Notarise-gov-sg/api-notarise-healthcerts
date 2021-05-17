import { wrapDocument, WrappedDocument } from "@govtechsg/open-attestation";
import { signDocument } from "@govtechsg/oa-did-sign";
import {
  HealthCertDocument,
  NotarizedHealthCert,
  SignedNotarizedHealthCert,
} from "../../../types";
import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import { config } from "../../../config";

const { didSigner } = config;

const signWrappedDocument = (
  wrappedDocument: WrappedDocument<NotarizedHealthCert>
) =>
  signDocument(
    wrappedDocument,
    "Secp256k1VerificationKey2018",
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
  return signWrappedDocument(wrappedNotarisedDocument);
};
