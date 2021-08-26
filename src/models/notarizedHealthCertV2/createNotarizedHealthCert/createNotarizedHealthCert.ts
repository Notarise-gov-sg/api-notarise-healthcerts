import { wrapDocument, WrappedDocument } from "@govtechsg/open-attestation";
import {
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/oa-did-sign";
import { Bundle } from "../../fhir/types";
import {
  EuHealthCertQr,
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
    wrappedDocument,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    didSigner.key,
    didSigner.privateKey
  ) as Promise<SignedNotarizedHealthCert>;

export const createNotarizedHealthCert = async (
  certificate: WrappedDocument<HealthCertDocument>,
  parseFhirBundle: Bundle,
  reference: string,
  storedUrl: string,
  euHealthCertQr?: EuHealthCertQr
) => {
  const unwrappedNotarisedDocument = createUnwrappedDocument(
    certificate,
    parseFhirBundle,
    reference,
    storedUrl,
    euHealthCertQr
  );
  const wrappedNotarisedDocument = wrapDocument(unwrappedNotarisedDocument);
  const traceWithRef = trace.extend(`reference: $[reference}`);
  traceWithRef("Document successfully notarised");
  return signWrappedDocument(wrappedNotarisedDocument);
};
