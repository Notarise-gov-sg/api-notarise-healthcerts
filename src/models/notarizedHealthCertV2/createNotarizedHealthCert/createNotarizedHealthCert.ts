import {
  wrapDocument,
  WrappedDocument,
  SignedWrappedDocument,
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import { ParsedBundle } from "../../fhir/types";
import { PDTHealthCertV2, EndorsedPDTHealthCertV2 } from "../../../types";
import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import { config } from "../../../config";
import { getLogger } from "../../../common/logger";

const { didSigner } = config;
const { trace } = getLogger("api-notarise-healthcerts");

/**
 * Signs a wrapped document
 * @param wrappedDocument
 * @returns
 */
const signWrappedDocument = (
  wrappedDocument: WrappedDocument<EndorsedPDTHealthCertV2>
): Promise<SignedWrappedDocument<EndorsedPDTHealthCertV2>> =>
  signDocument(
    wrappedDocument as any,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    {
      public: didSigner.key,
      private: didSigner.privateKey,
    }
  );

/**
 * Generates an endorsed HealthCert that is signed
 * @param wrappedHealthCert
 * @param parseFhirBundle
 * @param reference
 * @param storedUrl
 * @param signedEuHealthCerts
 * @returns
 */
export const createNotarizedHealthCert = async (
  wrappedHealthCert: WrappedDocument<PDTHealthCertV2>,
  parseFhirBundle: ParsedBundle,
  reference: string,
  storedUrl: string,
  signedEuHealthCerts?: notarise.SignedEuHealthCert[]
) => {
  const unwrappedNotarisedDocument = createUnwrappedDocument(
    wrappedHealthCert,
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
