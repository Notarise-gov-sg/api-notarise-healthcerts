import { R4 } from "@ahryman40k/ts-fhir-types";
import { fhirBundleV1, Patient } from "../types";
import { maskNricInFhirBundleV1, maskNricInFhirBundle } from "./maskNricFin";
import pdtUnwrappedSampleV1 from "../../test/fixtures/v1/example_healthcert_with_nric_unwrapped.json";
import pdtUnwrappedSampleV2 from "../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";

describe("test maskNricFinInPlace function", () => {
  it("nric should be masked for V1 Healthcert", () => {
    const { fhirBundle } = pdtUnwrappedSampleV1;

    const maskedFhirBundle = maskNricInFhirBundleV1(fhirBundle as any);
    const patient = (maskedFhirBundle as fhirBundleV1).entry.find(
      (entry) => entry.resourceType === "Patient"
    );
    const nricIdentifier = (patient as Patient).identifier.find(
      (i) => i.type !== "PPN" && i.type.text.toUpperCase() === "NRIC"
    );

    expect(fhirBundle).not.toEqual(maskNricInFhirBundle);
    expect(nricIdentifier?.value).toStrictEqual("S****989Z");
  });

  it("nric should be masked for V2 Healthcert", () => {
    const { fhirBundle } = pdtUnwrappedSampleV2;

    const maskedFhirBundle = maskNricInFhirBundle(fhirBundle as any);
    const patient = (maskedFhirBundle as R4.IBundle).entry?.find(
      (entry: any) => entry?.resource?.resourceType === "Patient"
    )?.resource as R4.IPatient;
    const nricIdentifier = patient.identifier?.find(
      (i) => i.id?.toUpperCase() === "NRIC-FIN"
    );

    expect(fhirBundle).not.toEqual(maskNricInFhirBundle);
    expect(nricIdentifier?.value).toStrictEqual("S****989Z");
  });
});
