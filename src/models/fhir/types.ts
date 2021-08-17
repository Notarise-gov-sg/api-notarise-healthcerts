import { R4 } from "@ahryman40k/ts-fhir-types";

export interface Patient {
  fullName: string;
  gender?: R4.PatientGenderKind;
  birthDate: string;
  nationality: R4.ICoding;
  passportNumber: string;
  nricFin?: string;
}

export interface Specimen {
  deviceResourceUuid?: string;
  swabType: R4.ICoding;
  collectionDateTime: string;
}

export interface Observation {
  practitionerResourceUuid: string;
  acsn: string;
  targetDisease: R4.ICoding;
  testType: R4.ICoding;
  result: R4.ICoding;
  effectiveDateTime: string;
  status: R4.ObservationStatusKind;
}

export interface Practitioner {
  fullName: string;
  mcr: string;
  organizationResourceUuid: string;
}

export interface Organization {
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

export interface Device {
  type: R4.ICoding;
}

export interface Bundle {
  patient: Patient;
  specimen: Specimen;
  observations: Observation[];
  practitioner: Practitioner;
  organisation: { moh: Organization; lhp: Organization; al?: Organization };
  device?: Device;
}
