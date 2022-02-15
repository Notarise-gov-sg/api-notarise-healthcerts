import { v2, WrappedDocument } from "@govtechsg/open-attestation";
import { Record, String, Static } from "runtypes";
import { notarise, pdtHealthCertV2 } from "@govtechsg/oa-schemata";

/**
 * ========= HealthCert Types Explained =========
 * x. [Type]: [Explaination] - [Function]
 *
 * 1. WrappedDocument<PDTHealthCertV2>: Received from clinic/provider
 * 2. PDTHealthCertV2: After unwrapping HealthCert - getData<WrappedDocument<PDTHealthCertV2>>()
 * 3. EndorsedPDTHealthCertV2: After adding `notarisationMetadata` field - createUnwrappedDocument()
 * 4. WrappedDocument<EndorsedPDTHealthCertV2>: After wrapping endorsed HealthCert - wrapDocument()
 * 5. SignedWrappedDocument<EndorsedPDTHealthCertV2>: After signing wrapped endorsed HealthCert - createNotarizedHealthCert()
 */

/**
 * HealthCert (unwrapped) in PDT Schema v2.0
 *
 * A HealthCert expected from a clinic/provider (after unwrapping).
 */
export interface PDTHealthCertV2
  extends pdtHealthCertV2.PDTHealthCertV2,
    Omit<v2.OpenAttestationDocument, "id"> {}

/**
 * Endorsed HealthCert (unwrapped) in PDT Schema v2.0
 *
 * An endorsed HealthCert generated by Notarise (before signing/wrapping).
 */
export interface EndorsedPDTHealthCertV2
  extends PDTHealthCertV2,
    notarise.Notarise {}

const UserDetailsT = Record({
  name: String,
  emailAddress: String,
});

export const WorkflowReferenceData = Record({
  reference: String,
});

export type WorkflowReferenceData = Static<typeof WorkflowReferenceData>;

export const WorkflowContextData = WorkflowReferenceData.And(
  Record({
    receivedTimestamp: String,
    user: UserDetailsT,
    s3ObjKey: String,
  })
);
export type WorkflowContextData = Static<typeof WorkflowContextData>;

export interface TestData {
  provider: string;
  lab?: string;
  swabType: string;
  swabTypeCode: string;
  patientName: string;
  swabCollectionDate: string;
  performerName: string;
  performerMcr: string;
  observationDate: string;
  nric: string;
  passportNumber: string;
  birthDate: string;
  testType: string;
  testCode: string;
  nationality: string;
  gender: string;
  testResult: string;
  testResultCode: string;
  deviceIdentifier?: string;
}

export interface EuTestParams {
  tg: string;
  tt: string;
  nm?: string;
  ma?: string;
  sc: string;
  tr: string;
  tc: string;
  co: string;
  is: string;
  ci: string;
}

export interface EuNameParams {
  fn?: string;
  fnt: string;
  gn?: string;
  gnt?: string;
}

export interface EuHealthCertDocument {
  ver: string;
  nam: EuNameParams;
  dob: string;
  t: EuTestParams[];
}
export interface EuHealthCert extends EuHealthCertDocument {
  meta: notarise.NotarisationMetadata;
}

export interface NotarisationResult {
  notarisedDocument: WrappedDocument<EndorsedPDTHealthCertV2>;
  ttl: number;
  url: string;
  gpayCovidCardUrl?: string;
}
