import { getData } from "@govtechsg/open-attestation";
import { HealthCertDocument } from "src/types";
import {
  getNRICIdentifierV1,
  getNRICIdentifierV2,
  maskNRIC,
  NricIdentifier,
} from ".";
import PDTV1 from "../../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import PDTV2 from "../../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";

describe("test maskNricFinInPlace function", () => {
  it("nric should be masked for V1 Healthcert", () => {
    const data = getData(PDTV1 as any) as HealthCertDocument;
    const nricIdentifier = getNRICIdentifierV1(data) as NricIdentifier;

    expect(nricIdentifier).not.toBeNull();
    nricIdentifier.value = maskNRIC(nricIdentifier.value);
    expect(nricIdentifier.value.includes("****")).toBeTruthy();
  });

  it("nric should be masked for V2 Healthcert", () => {
    const data = getData(PDTV2 as any) as HealthCertDocument;
    const nricIdentifier = getNRICIdentifierV2(data) as NricIdentifier;

    expect(nricIdentifier).not.toBeNull();
    nricIdentifier.value = maskNRIC(nricIdentifier.value);
    expect(nricIdentifier.value.includes("****")).toBeTruthy();
  });
});
