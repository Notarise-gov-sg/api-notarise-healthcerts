import { R4 } from "@ahryman40k/ts-fhir-types";

export interface ParsedPatient {
  fullName: string;
  gender?: R4.PatientGenderKind;
  birthDate: string;
  nationality: R4.ICoding;
  passportNumber: string;
  nricFin?: string;
}

export interface ParsedSpecimen {
  deviceResourceUuid?: string;
  swabType: R4.ICoding;
  collectionDateTime: string;
}

export interface ParsedObservation {
  specimenResourceUuid: string;
  practitionerResourceUuid: string;
  organizationLhpResourceUuid: string;
  organizationAlResourceUuid?: string;
  acsn: string;
  targetDisease: R4.ICoding;
  testType: R4.ICoding;
  result: R4.ICoding;
  effectiveDateTime: string;
  status: R4.ObservationStatusKind;
  modality?: string;
}

export interface ParsedPractitioner {
  fullName: string;
  mcr: string;
  organizationMohResourceUuid: string;
}

export interface ParsedOrganization {
  fullName: string;
  type: R4.ICoding;
  url: string;
  phone: string;
  address: {
    type: R4.AddressTypeKind;
    use: R4.AddressUseKind;
    text: string;
  };
}

export interface ParsedDevice {
  type: R4.ICoding;
}

export interface GroupedObservation {
  observation: ParsedObservation;
  specimen: ParsedSpecimen;
  device?: ParsedDevice;
  practitioner: ParsedPractitioner;
  organization: { lhp: ParsedOrganization; al?: ParsedOrganization };
}

export interface ParsedBundle {
  patient: ParsedPatient;
  observations: GroupedObservation[];
  organization: { moh: ParsedOrganization };
}
