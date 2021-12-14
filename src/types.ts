import {
  v2,
  SignedWrappedDocument,
  WrappedDocument,
} from "@govtechsg/open-attestation";
import { Record, String, Static } from "runtypes";
import { notarise, pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { R4 } from "@ahryman40k/ts-fhir-types";

/* eslint-disable */
enum EntryResourceType {
  Patient = "Patient",
  Observation = "Observation",
  Specimen = "Specimen",
  Organization = "Organization",
  Device = "Device",
}
/* eslint-disable */

/**
 * @deprecated This interface should be remove after v1 healthcert deprecate.
 */
export interface Patient {
  resourceType: EntryResourceType.Patient;
  identifier: [
    {
      type: "PPN" | { text: "NRIC" };
      value: string;
    }
  ];
  name: string;
}

/**
 * @deprecated This interface should be remove after v1 healthcert deprecate.
 */
export interface Observation {
  resourceType: EntryResourceType.Observation;
  valueCodeableConcept: {
    coding: [{ system: string; code: string; display: string }];
  };
  code: {
    coding: [{ system: string; code: string; display: string }];
  };
  specimen: {
    reference: string;
  };
}

/**
 * @deprecated This interface should be remove after v1 healthcert deprecate.
 */
export interface Specimen {
  fullUrl?: string;
  resourceType: EntryResourceType.Specimen;
  collection: {
    collectedDateTime: string;
  };
}

/**
 * @deprecated This interface should be remove after v1 healthcert deprecate.
 */
export interface Organisation {
  fullUrl?: string;
  type: string;
  resourceType: EntryResourceType.Organization;
}

/**
 * @deprecated This interface should be remove after v1 healthcert deprecate.
 */
export interface Device {
  resourceType: EntryResourceType.Device;
  type: {
    coding: [
      {
        system: string;
        code: string;
        display: string;
      }
    ];
    text: string;
  };
  identifier: [
    {
      system: string;
      value: string;
    }
  ];
}

/**
 * @deprecated This interface should be remove after v1 healthcert deprecate.
 */
export interface fhirBundleV1 {
  entry: [Patient | Observation | Specimen | Organisation | Device];
}

/**
 * @deprecated This interface should be removed when PDT HealthCert v1.0 is deprecated.
 */
export interface HealthCertDocument extends v2.OpenAttestationDocument {
  version?: string;
  type?: string;
  name?: string;
  validFrom: string;
  fhirVersion: string;
  logo: string;
  fhirBundle: fhirBundleV1 | R4.IBundle;
}

/**
 * @deprecated This interface should be removed when PDT HealthCert v1.0 is deprecated.
 */
export interface NotarizedHealthCert extends HealthCertDocument {
  notarisationMetadata: notarise.NotarisationMetadata;
}

/**
 * HealthCert (unwrapped) in PDT Schema v2.0
 */
export interface PDTHealthCertV2
  extends pdtHealthCertV2.PDTHealthCertV2,
    Omit<v2.OpenAttestationDocument, "id"> {}

export interface NotarisedPDTHealthCertV2Document
  extends PDTHealthCertV2,
    notarise.Notarise {}

export type SignedNotarisedPDTHealthCertV2Document =
  SignedWrappedDocument<NotarisedPDTHealthCertV2Document>;

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

/**
 * @deprecated This interface should be removed when PDT HealthCert v1.0 is deprecated.
 */
export type SignedNotarizedHealthCert =
  SignedWrappedDocument<NotarizedHealthCert>;

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
  notarisedDocument: WrappedDocument<
    HealthCertDocument | NotarisedPDTHealthCertV2Document
  >;
  ttl: number;
  url: string;
  gpayCovidCardUrl?: string;
}
