import { v2, SignedWrappedDocument } from "@govtechsg/open-attestation";
import { Record, String, Static } from "runtypes";
import { NotarisationMetadata } from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/tech/notarise/1.0/schema";
import { EntryResourceType } from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/moh/healthcert/1.0/schema";

export interface HealthCertDocument extends v2.OpenAttestationDocument {
  name: string;
  validFrom: string;
  fhirVersion: string;
  logo: string;
  fhirBundle: {
    entry: [Patient | Observation | Specimen | Organisation];
  };
}
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

export interface Specimen {
  fullUrl?: string;
  resourceType: EntryResourceType.Specimen;
  collection: {
    collectedDateTime: string;
  };
}

export interface Organisation {
  fullUrl?: string;
  type: string;
  resourceType: EntryResourceType.Organization;
}

export interface NotarizedHealthCert extends HealthCertDocument {
  notarisationMetadata: NotarisationMetadata;
}

const UserDetailsT = Record({
  name: String,
  emailAddress: String
});

export const WorkflowReferenceData = Record({
  reference: String
});

export type WorkflowReferenceData = Static<typeof WorkflowReferenceData>;

export const WorkflowContextData = WorkflowReferenceData.And(
  Record({
    receivedTimestamp: String,
    user: UserDetailsT
  })
);
export type WorkflowContextData = Static<typeof WorkflowContextData>;

export type SignedNotarizedHealthCert = SignedWrappedDocument<
  NotarizedHealthCert
>;
