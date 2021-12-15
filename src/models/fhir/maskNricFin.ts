import { getLogger } from "../../common/logger";
import {
  BundleV2,
  fhirBundleV1,
  HealthCertDocument,
  PDTHealthCertV2,
} from "../../types";

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

// get a pointer to the nested nric object in v1 healthcert
// so that can maskNRIC() in place
export const getNricObjV1 = (
  data: HealthCertDocument
): NricIdentifier | null => {
  try {
    const bundle = data.fhirBundle as fhirBundleV1;
    const entry = bundle.entry.find((ent) => ent.resourceType === "Patient");
    const nricIdentifier = (entry as any).identifier?.find((ident: any) =>
      ident.type?.text?.includes("NRIC")
    );
    return nricIdentifier;
  } catch (error) {
    logError(`cannot find nested nric identity object: ${error}`);
    return null;
  }
};

// get a pointer to the nested nric object in v2 healthcert
// so that can maskNRIC() in place
export const getNricObjV2 = (data: PDTHealthCertV2): NricIdentifier | null => {
  try {
    const bundle = data.fhirBundle as any as BundleV2;
    const entry = bundle.entry.find(
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
