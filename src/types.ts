import { v2, SignedWrappedDocument } from "@govtechsg/open-attestation";
import { Record, String, Static } from "runtypes";
import { NotarisationMetadata } from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/tech/notarise/1.0/schema";

export interface HealthCertDocument extends v2.OpenAttestationDocument {
  name: string;
  validFrom: string;
  fhirVersion: string;
  logo: string;
  fhirBundle: {
    entry: [
      {
        resourceType: "Patient";
        identifier: [
          {
            type: "PPN" | { text: "NRIC" };
            value: string;
          }
        ];
      }
    ];
  };
}
export interface NotarizedHeathCert extends HealthCertDocument {
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
  NotarizedHeathCert
>;
