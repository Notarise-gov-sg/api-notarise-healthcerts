import { R4 } from "@ahryman40k/ts-fhir-types";
import { PDTHealthCertV2 } from "../types";

// Get the reference to the nested nric identifier object
// mask the value in place

const maskNric = (nric: string) => `${nric[0]}****${nric.slice(5)}`;

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
