import { getLogger } from "../../common/logger";
import { HealthCertDocument } from "../../types";

export interface NricIdentifier {
  id?: string;
  value: string;
  type?: {
    text: string;
  };
}

// Get the reference to the nested nric identifier object
// mask the value in place

const { error: logError } = getLogger("maskNRIC");

export const maskNRIC = (nric: string) => `${nric[0]}****${nric.slice(5)}`;

export const getNRICIdentifierV1 = (
  data: HealthCertDocument
): NricIdentifier | null => {
  try {
    const entry = (data.fhirBundle.entry as any[]).find(
      (ent) => ent.resourceType === "Patient"
    );
    const nricIdentifier = entry?.identifier?.find((ident: any) =>
      ident.type?.text?.includes("NRIC")
    );
    return nricIdentifier;
  } catch (error) {
    logError(`cannot find nested nric identity object: ${error}`);
    return null;
  }
};

export const getNRICIdentifierV2 = (
  data: HealthCertDocument
): NricIdentifier | null => {
  try {
    const entry = (data.fhirBundle.entry as any[]).find(
      (ent) => ent.resource?.resourceType === "Patient"
    );
    const nricIdentifier = entry?.resource?.identifier?.find((ident: any) =>
      ident.id?.includes("NRIC")
    );
    return nricIdentifier;
  } catch (error) {
    logError(`cannot find nested nric identity object: ${error}`);
    return null;
  }
};
