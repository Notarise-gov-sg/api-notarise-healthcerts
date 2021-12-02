import {
  wrapDocument,
  WrappedDocument,
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import { ParsedBundle } from "../../fhir/types";
import {
  PDTHealthCertV2Document,
  NotarisedPDTHealthCertV2Document,
  SignedNotarisedPDTHealthCertV2Document,
} from "../../../types";
import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import { config } from "../../../config";
import { getLogger } from "../../../common/logger";

const { didSigner } = config;
const { trace } = getLogger("api-notarise-healthcerts");

const signWrappedDocument = (
  wrappedDocument: WrappedDocument<NotarisedPDTHealthCertV2Document>
) =>
  signDocument(
    wrappedDocument as any,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    {
      public: didSigner.key,
      private: didSigner.privateKey,
    }
  ) as Promise<SignedNotarisedPDTHealthCertV2Document>;

export const createNotarizedHealthCert = async (
  certificate: WrappedDocument<PDTHealthCertV2Document>,
  parseFhirBundle: ParsedBundle,
  reference: string,
  storedUrl: string,
  signedEuHealthCerts?: notarise.SignedEuHealthCert[]
) => {
  const unwrappedNotarisedDocument = createUnwrappedDocument(
    certificate,
    parseFhirBundle,
    reference,
    storedUrl,
    signedEuHealthCerts
  );
  const wrappedNotarisedDocument = wrapDocument(unwrappedNotarisedDocument);
  const traceWithRef = trace.extend(`reference: ${reference}`);
  traceWithRef("Document successfully notarised");
  return signWrappedDocument(wrappedNotarisedDocument);
};
