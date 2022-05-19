import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { R4 } from "@ahryman40k/ts-fhir-types";
import {
  ParsedBundle,
  ParsedPatient,
  ParsedSpecimen,
  ParsedObservation,
  ParsedPractitioner,
  ParsedOrganization,
  GroupedObservation,
  ParsedDevice,
} from "./types";

dayjs.locale("en-sg");
dayjs.extend(utc);
dayjs.extend(customParseFormat);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Fhir } = require("fhir");

const fhir = new Fhir();

/**
 * The mapping definition of each FHIR resource.
 *
 * Note: This function will ONLY validate a resource against FHIR base spec.
 * @param resource Raw FHIR resource
 * @returns Parsed FHIR resource (simplified)
 */
export const parsers = (resource: R4.IResourceList | undefined) => {
  if (!resource) return undefined; // Skip parsing an undefined resource

  const validator = fhir.validate(resource, { errorOnUnexpected: true });
  if (!validator.valid) {
    throw new Error(
      `Validation against FHIR base spec has failed for ${
        resource.resourceType
      }: ${JSON.stringify(validator.messages)}`
    );
  }

  switch (resource.resourceType) {
    case "Bundle":
      return resource;

    case "Patient":
      return {
        fullName: resource.name?.[0].text,
        gender: resource.gender,
        birthDate: dayjs(
          resource.birthDate,
          ["YYYY", "YYYY-MM", "YYYY-MM-DD"],
          true
        ).isValid()
          ? resource.birthDate
          : dayjs(resource.birthDate).isValid()
          ? dayjs.utc(resource.birthDate).format("YYYY-MM-DD")
          : dayjs.utc(resource.birthDate?.split("T")[0]).format("YYYY-MM-DD"),
        nationality: resource.extension?.[0].extension?.find(
          (e) => e.url === "code"
        )?.valueCodeableConcept?.coding?.[0],
        passportNumber: resource.identifier?.find((i) => i.id === "PPN")?.value,
        nricFin: resource.identifier?.find((i) => i.id === "NRIC-FIN")?.value,
      } as ParsedPatient;

    case "Specimen":
      return {
        swabType: resource.type?.coding?.[0],
        collectionDateTime: dayjs(
          resource.collection?.collectedDateTime
        ).isValid()
          ? dayjs
              .utc(resource.collection?.collectedDateTime)
              .format("YYYY-MM-DDTHH:mm:ss[Z]")
          : dayjs
              .utc(resource.collection?.collectedDateTime?.split("T")[0])
              .format("YYYY-MM-DDTHH:mm:ss[Z]"),
        deviceResourceUuid: resource.subject?.reference, // Only for ART
      } as ParsedSpecimen;

    case "Observation":
      return {
        specimenResourceUuid: resource.specimen?.reference,
        practitionerResourceUuid: resource.performer?.find(
          (p) => p.type === "Practitioner"
        )?.reference,
        organizationLhpResourceUuid: resource.performer?.find(
          (p) => p.type === "Organization" && p.id === "LHP"
        )?.reference,
        organizationAlResourceUuid: resource.performer?.find(
          (p) => p.type === "Organization" && p.id === "AL"
        )?.reference,
        acsn: resource.identifier?.find((i) => i.id === "ACSN")?.value,
        targetDisease: resource.category?.[0].coding?.[0],
        testType: resource.code?.coding?.[0],
        result: resource.valueCodeableConcept?.coding?.[0],
        effectiveDateTime: dayjs(resource.effectiveDateTime).isValid()
          ? dayjs
              .utc(resource.effectiveDateTime)
              .format("YYYY-MM-DDTHH:mm:ss[Z]")
          : dayjs
              .utc(resource.effectiveDateTime?.split("T")[0])
              .format("YYYY-MM-DDTHH:mm:ss[Z]"),
        status: resource.status,
        modality: resource.note?.find((n) => n.id === "MODALITY")?.text,
      } as ParsedObservation;

    case "Practitioner":
      return {
        fullName: resource.name?.[0].text,
        mcr: resource.qualification?.[0].identifier?.find((i) => i.id === "MCR")
          ?.value,
        organizationMohResourceUuid:
          resource.qualification?.[0].issuer?.reference,
      } as ParsedPractitioner;

    case "Organization":
      return {
        fullName: resource.name,
        type: resource.type?.[0].coding?.[0],
        url: resource.contact?.[0].telecom?.find((t) => t.system === "url")
          ?.value,
        phone: resource.contact?.[0].telecom?.find((t) => t.system === "phone")
          ?.value,
        address: resource.contact?.[0].address,
      } as ParsedOrganization;

    case "Device":
      return {
        type: resource.type?.coding?.[0],
      } as ParsedDevice;

    default:
      throw new Error(`Unable to find an appropriate parser for: ${resource}`);
  }
};

/**
 * Parses a Bundle of resources into a simplified format.
 *
 * @param fhirBundle Raw FHIR Bundle resource
 * @returns An object containing all the parsed resources in the bundle (simplified)
 */
export const parse = (fhirBundle: R4.IBundle): ParsedBundle => {
  //  0. Bundle resource
  parsers(fhirBundle);

  // 1. Patient resource
  const fhirPatient = fhirBundle.entry?.find(
    (entry) => entry.resource?.resourceType === "Patient"
  )?.resource;
  const patient = parsers(fhirPatient) as ParsedPatient;

  // 2. Observation resource(s)
  const observations = fhirBundle.entry
    ?.filter((entry) => entry.resource?.resourceType === "Observation")
    ?.map((o) => {
      const observation = parsers(o.resource) as ParsedObservation;

      // 2a. Specimen resource
      const fhirSpecimen = fhirBundle.entry?.find(
        (entry) => entry.fullUrl === observation.specimenResourceUuid
      )?.resource;
      const specimen = parsers(fhirSpecimen) as ParsedSpecimen;

      // 2b. Practitioner resource
      const fhirPractitioner = fhirBundle.entry?.find(
        (entry) => entry.fullUrl === observation.practitionerResourceUuid
      )?.resource;
      const practitioner = parsers(fhirPractitioner) as ParsedPractitioner;

      // 2c. Organization (Licensed Healthcare Provider) resource
      const fhirOrganizationLhp = fhirBundle.entry?.find(
        (entry) => entry.fullUrl === observation.organizationLhpResourceUuid
      )?.resource;
      const lhp = parsers(fhirOrganizationLhp) as ParsedOrganization;

      // 2d. Organization (Accredited Laboratory) resource [Only for PCR]
      const fhirOrganizationAl = fhirBundle.entry?.find(
        (entry) => entry.fullUrl === observation.organizationAlResourceUuid
      )?.resource;
      const al = parsers(fhirOrganizationAl) as ParsedOrganization;

      // 2e. Device resource [Only for ART]
      const fhirDevice = fhirBundle.entry?.find(
        (entry) => entry.fullUrl === specimen.deviceResourceUuid
      )?.resource;
      const device = parsers(fhirDevice) as ParsedDevice;

      return {
        observation,
        specimen,
        device,
        practitioner,
        organization: { lhp, al },
      };
    }) as GroupedObservation[];

  // 3. Organization (MOH) resource
  const fhirOrganizationMoh = fhirBundle.entry?.find(
    (entry) =>
      entry.fullUrl ===
      observations?.[0].practitioner.organizationMohResourceUuid
  )?.resource;
  const moh = parsers(fhirOrganizationMoh) as ParsedOrganization;

  return {
    patient,
    observations,
    organization: { moh },
  };
};
