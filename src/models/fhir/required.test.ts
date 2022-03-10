import { R4 } from "@ahryman40k/ts-fhir-types";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { DetailedCodedError } from "../../common/error";
import fhirHelper from "./index";
import examplePcrHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleArtHealthCertWithNric from "../../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";

const { PdtTypes } = pdtHealthCertV2;

describe("validatePCRHealthCertData", () => {
  test("should pass for valid PCR healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Pcr, parseFhirBundle)
    ).not.toThrow();
  });
  test("should pass for valid SER healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Ser, parseFhirBundle)
    ).not.toThrow();
  });
  test("should throw error if PCR healthcert not have Accredited Laboratory", () => {
    let thrownError;
    const parseFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    try {
      fhirHelper.hasRequiredFields(PdtTypes.Pcr, parseFhirBundle);
    } catch (e) {
      if (e instanceof DetailedCodedError) {
        thrownError = `${e.title}, ${e.messageBody}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'Observation.performer[2].{ id=AL, type=Organization, reference }' is required\\",\\"'0.Organization.name' is required\\",\\"'0.Organization.type[0].coding[0].system' is required\\",\\"'0.Organization.type[0].coding[0].code' is required\\",\\"'0.Organization.type[0].coding[0].display' is required\\",\\"'0.Organization.contact[0].telecom[0].{ system=url, value }' is required\\",\\"'0.Organization.contact[0].telecom[1].{ system=phone, value }' is required\\",\\"'0.Organization.contact[0].address.type' is required\\",\\"'0.Organization.contact[0].address.use' is required\\",\\"'0.Organization.contact[0].address.text' is required\\"]. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38"`
    );
  });
});
describe("validateARTHealthCertData", () => {
  test("should pass for valid ART healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Art, parseFhirBundle)
    ).not.toThrow();
  });

  test("should throw error if ART healthcert lacks Observation.modality", () => {
    let thrownError;
    const malformedHealthCert = examplePcrHealthCertWithNric;

    const parseFhirBundle = fhirHelper.parse(
      malformedHealthCert.fhirBundle as R4.IBundle
    );

    try {
      fhirHelper.hasRequiredFields(PdtTypes.Art, parseFhirBundle);
    } catch (e) {
      if (e instanceof DetailedCodedError) {
        thrownError = `${e.title}, ${e.messageBody}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'0.Specimen.subject.{ type=Device, reference }' is required\\",\\"'0.Device.type.coding[0].system' is required\\",\\"'0.Device.type.coding[0].code' is required\\",\\"'0.Device.type.coding[0].display' is required\\",\\"'0.Observation.note[n].{ id=MODALITY, text }' is required\\"]. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38"`
    );
  });

  test("should throw error if ART healthcert not have device identifier", () => {
    let thrownError;
    const malformedHealthCert = exampleArtHealthCertWithNric as any;
    malformedHealthCert.fhirBundle.entry.pop();
    const parseFhirBundle = fhirHelper.parse(
      malformedHealthCert.fhirBundle as R4.IBundle
    );
    try {
      fhirHelper.hasRequiredFields(PdtTypes.Art, parseFhirBundle);
    } catch (e) {
      if (e instanceof DetailedCodedError) {
        thrownError = `${e.title}, ${e.messageBody}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'0.Device.type.coding[0].system' is required\\",\\"'0.Device.type.coding[0].code' is required\\",\\"'0.Device.type.coding[0].display' is required\\"]. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38"`
    );
  });
});
