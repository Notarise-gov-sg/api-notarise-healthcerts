import { R4 } from "@ahryman40k/ts-fhir-types";
import {
  Patient,
  Specimen,
  Observation,
  Practitioner,
  Organization,
} from "./types";

const Fhir = require("fhir").Fhir;
const fhir = new Fhir();

export const parse = (type: "PCR" | "ART", fhirBundle: R4.IBundle) => {
  //  0. Bundle resource
  parsers(fhirBundle);

  // 1. Patient resource
  const fhirPatient = fhirBundle.entry?.find(
    (entry) => entry.resource?.resourceType === "Patient"
  )?.resource;
  const patient = parsers(fhirPatient) as Patient;

  // 2. Specimen resource
  const fhirSpecimen = fhirBundle.entry?.find(
    (entry) => entry.resource?.resourceType === "Specimen"
  )?.resource;
  const specimen = parsers(fhirSpecimen) as Specimen;

  // 3. Observation resource(s)
  const observations = fhirBundle.entry
    ?.filter((entry) => entry.resource?.resourceType === "Observation")
    ?.map((o) => parsers(o.resource) as Observation)!;

  // 4. Practitioner resource
  const fhirPractitioner = fhirBundle.entry?.find(
    (entry) => entry.fullUrl === observations?.[0].practitionerResourceUuid
  )?.resource;
  const practitioner = parsers(fhirPractitioner) as Practitioner;

  // 5. Organization (MOH) resource
  const fhirOrganizationMoh = fhirBundle.entry?.find(
    (entry) => entry.fullUrl === practitioner.organizationResourceUuid
  )?.resource;
  const moh = parsers(fhirOrganizationMoh) as Organization;

  // 6. Organization (Licensed Healthcare Provider) resource
  const fhirOrganizationLhp = fhirBundle.entry?.find(
    (entry) =>
      entry.resource?.resourceType === "Organization" &&
      entry.resource?.type?.[0].text === "Licensed Healthcare Provider"
  )?.resource;
  const lhp = parsers(fhirOrganizationLhp) as Organization;

  // 7. Organization (Accredited Laboratory) resource
  const fhirOrganizationAl = fhirBundle.entry?.find(
    (entry) =>
      entry.resource?.resourceType === "Organization" &&
      entry.resource?.type?.[0].text === "Accredited Laboratory"
  )?.resource;
  const al = parsers(fhirOrganizationAl) as Organization; // Only for PCR

  return {
    patient,
    specimen,
    observations,
    practitioner,
    organisation: { moh, lhp, al },
  };
};

const parsers = (resource: R4.IResourceList | undefined) => {
  /* Validate resource against FHIR base spec */
  const validator = fhir.validate(resource, { errorOnUnexpected: true });
  if (!validator.valid) {
    throw new Error(JSON.stringify(validator.messages));
  }

  switch (resource?.resourceType) {
    case "Bundle":
      return resource;

    case "Patient":
      return {
        fullName: resource.name?.[0].text,
        gender: resource.gender,
        birthDate: resource.birthDate,
        nationality: resource.extension?.[0].extension?.find(
          (e) => e.url === "code"
        )?.valueCodeableConcept?.coding?.[0],
        passportNumber: resource.identifier?.find((i) => i.id === "PPN")?.value,
        nricFin: resource.identifier?.find((i) => i.id === "NRIC-FIN")?.value,
      } as Patient;

    case "Specimen":
      return {
        swabType: resource.type?.coding?.[0],
        collectionDateTime: resource.collection?.collectedDateTime,
        // deviceResourceUuid: resource.subject?.reference, // Only for ART
      } as Specimen;

    case "Observation":
      return {
        practitionerResourceUuid: resource.performer?.[0].reference,
        acsn: resource.identifier?.find((i) => i.id === "ACSN")?.value,
        targetDisease: resource.category?.[0].coding?.[0],
        result: resource.valueCodeableConcept?.coding?.[0],
        effectiveDateTime: resource.effectiveDateTime,
        status: resource.status,
      } as Observation;

    case "Practitioner":
      return {
        fullName: resource.name?.[0].text,
        mcr: resource.qualification?.[0].identifier?.find((i) => i.id === "MCR")
          ?.value,
        organizationResourceUuid: resource.qualification?.[0].issuer?.reference,
      } as Practitioner;

    case "Organization":
      return {
        fullName: resource.name,
        type: resource.type?.[0].coding?.[0],
        url: resource.contact?.[0].telecom?.find((t) => t.system === "url")
          ?.value,
        phone: resource.contact?.[0].telecom?.find((t) => t.system === "phone")
          ?.value,
        address: resource.contact?.[0].address,
      } as Organization;
    default:
      throw new Error(`Unable to find an appropriate parser for: ${resource}`);
  }
};
