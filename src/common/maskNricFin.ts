import { R4 } from "@ahryman40k/ts-fhir-types";
import { fhirBundleV1, Patient, PDTHealthCertV2 } from "../types";

// Get the reference to the nested nric identifier object
// mask the value in place

const maskNric = (nric: string) => `${nric[0]}****${nric.slice(5)}`;

/**
 * @deprecated This function should be removed when PDT HealthCert v1.0 is deprecated.
 */
export const maskNricInFhirBundleV1 = (
  fhirBundle: fhirBundleV1 | R4.IBundle
) => {
  const patient = (fhirBundle as fhirBundleV1).entry.find(
    (entry) => entry.resourceType === "Patient"
  );
  const nricIdentifier = (patient as Patient).identifier.find(
    (i) => i.type !== "PPN" && i.type.text.toUpperCase() === "NRIC"
  );

  // Mask NRIC by reference
  if (nricIdentifier?.value)
    nricIdentifier.value = maskNric(nricIdentifier.value);

  return fhirBundle;
};

export const maskNricInFhirBundle = (
  fhirBundle: PDTHealthCertV2["fhirBundle"]
) => {
  // PDTHealthCertV2["fhirBundle"] and R4.IBundle can be used interchangeably
  const patient = (fhirBundle as R4.IBundle).entry?.find(
    (entry: any) => entry?.resource?.resourceType === "Patient"
  )?.resource as R4.IPatient;
  const nricIdentifier = patient.identifier?.find(
    (i) => i.id?.toUpperCase() === "NRIC-FIN"
  );

  // Mask NRIC by reference
  if (nricIdentifier?.value)
    nricIdentifier.value = maskNric(nricIdentifier.value);

  return fhirBundle;
};
