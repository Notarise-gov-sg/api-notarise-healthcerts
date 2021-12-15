import { getData } from "@govtechsg/open-attestation";
import { HealthCertDocument, PDTHealthCertV2 } from "../types";
import {
  getNricObjV1,
  getNricObjV2,
  maskNRIC,
  NricIdentifier,
} from "./maskNricFin";
import PDTV1 from "../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import PDTV2 from "../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";

describe("test maskNricFinInPlace function", () => {
  it("nric should be masked for V1 Healthcert", () => {
    const data = getData(PDTV1 as any) as HealthCertDocument;
    const nricIdentifier = getNricObjV1(data) as NricIdentifier;

    expect(nricIdentifier).not.toBeNull();
    nricIdentifier.value = maskNRIC(nricIdentifier.value);
    expect(nricIdentifier.value.includes("S****989Z")).toBeTruthy();
  });

  it("nric should be masked for V2 Healthcert", () => {
    const data = getData(PDTV2 as any) as PDTHealthCertV2;
    const nricIdentifier = getNricObjV2(data) as NricIdentifier;

    expect(nricIdentifier).not.toBeNull();
    nricIdentifier.value = maskNRIC(nricIdentifier.value);
    expect(nricIdentifier.value.includes("S****989Z")).toBeTruthy();
  });
});
