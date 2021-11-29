import {
  wrapDocument,
  WrappedDocument,
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import {
  HealthCertDocument,
  NotarizedHealthCert,
  SignedNotarizedHealthCert,
} from "../../../types";
import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import { config } from "../../../config";
import { getLogger } from "../../../common/logger";

const { didSigner } = config;
const { trace } = getLogger("api-notarise-healthcerts");

const signWrappedDocument = (
  wrappedDocument: WrappedDocument<NotarizedHealthCert>
) =>
  signDocument(
    wrappedDocument as any,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    {
      public: didSigner.key,
      private: didSigner.privateKey,
    }
  ) as Promise<SignedNotarizedHealthCert>;

export const createNotarizedHealthCert = async (
  certificate: WrappedDocument<HealthCertDocument>,
  reference: string,
  storedUrl: string,
  signedEuHealthCerts?: notarise.SignedEuHealthCert[]
) => {
  const unwrappedNotarisedDocument = createUnwrappedDocument(
    certificate,
    reference,
    storedUrl,
    signedEuHealthCerts
  );
  const wrappedNotarisedDocument = wrapDocument(unwrappedNotarisedDocument);
  const traceWithRef = trace.extend(`reference: ${reference}`);
  traceWithRef("Document successfully notarised");
  return signWrappedDocument(wrappedNotarisedDocument);
};
