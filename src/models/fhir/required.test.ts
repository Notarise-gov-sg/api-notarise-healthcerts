import { R4 } from "@ahryman40k/ts-fhir-types";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { CodedError } from "../../common/error";
import fhirHelper from "./index";
import examplePcrHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleArtHealthCertWithNric from "../../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";
import exampleMultiTypeHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_ser_multi_result_unwrapped.json";

const { PdtTypes } = pdtHealthCertV2;

describe("PCR: Required values", () => {
  test("should pass for valid PCR healthcert", () => {
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Pcr, parsedFhirBundle)
    ).not.toThrow();
  });
  test("should pass for valid SER healthcert", () => {
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Ser, parsedFhirBundle)
    ).not.toThrow();
  });
  test("should throw error if PCR healthcert has missing Accredited Laboratory", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    try {
      fhirHelper.hasRequiredFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'Observation.performer[2].{ id=AL, type=Organization, reference }' is required\\",\\"'0.Organization.name' is required\\",\\"'0.Organization.type[0].coding[0].system' is required\\",\\"'0.Organization.type[0].coding[0].code' is required\\",\\"'0.Organization.type[0].coding[0].display' is required\\",\\"'0.Organization.contact[0].telecom[0].{ system=url, value }' is required\\",\\"'0.Organization.contact[0].telecom[1].{ system=phone, value }' is required\\",\\"'0.Organization.contact[0].address.type' is required\\",\\"'0.Organization.contact[0].address.use' is required\\",\\"'0.Organization.contact[0].address.text' is required\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
});

describe("ART: Required values", () => {
  test("should pass for valid ART healthcert", () => {
    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Art, parsedFhirBundle)
    ).not.toThrow();
  });
  test("should throw error if ART healthcert has missing Modality", () => {
    let thrownError;

    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    delete parsedFhirBundle.observations[0].observation.modality;

    try {
      fhirHelper.hasRequiredFields(PdtTypes.Art, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'0.Observation.note[n].{ id=MODALITY, text }' is required\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
  test("should throw error if ART healthcert has missing Device", () => {
    let thrownError;

    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    delete parsedFhirBundle.observations[0].device;

    try {
      fhirHelper.hasRequiredFields(PdtTypes.Art, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'0.Device.type.coding[0].system' is required\\",\\"'0.Device.type.coding[0].code' is required\\",\\"'0.Device.type.coding[0].display' is required\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
});

describe("Multi type: Required values", () => {
  test("should pass for valid PCR+SER healthcert", () => {
    const parsedFhirBundle = fhirHelper.parse(
      exampleMultiTypeHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(
        [PdtTypes.Pcr, PdtTypes.Ser],
        parsedFhirBundle
      )
    ).not.toThrow();
  });

  test("should throw error for invalid PCR+SER healthcert with only 1 observation", () => {
    let thrownError;

    const parsedFhirBundle = fhirHelper.parse(
      exampleMultiTypeHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations.pop();

    try {
      fhirHelper.hasRequiredFields(
        [PdtTypes.Pcr, PdtTypes.Ser],
        parsedFhirBundle
      );
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: [\\"'1.Observation.specimen.{ type=Specimen, reference }' is required\\",\\"'1.Observation.performer[0].{ type=Practitioner, reference }' is required\\",\\"'1.Observation.performer[1].{ id=LHP, type=Organization, reference }' is required\\",\\"'1.Observation.identifier[id=ACSN].value' is required\\",\\"'1.Observation.category[0].coding[0].system' is required\\",\\"'1.Observation.category[0].coding[0].code' is required\\",\\"'1.Observation.category[0].coding[0].display' is required\\",\\"'1.Observation.code.coding[0].system' is required\\",\\"'1.Observation.code.coding[0].code' is required\\",\\"'1.Observation.code.coding[0].display' is required\\",\\"'1.Observation.valueCodeableConcept.coding[0].system' is required\\",\\"'1.Observation.valueCodeableConcept.coding[0].code' is required\\",\\"'1.Observation.valueCodeableConcept.coding[0].display' is required\\",\\"'1.Observation.effectiveDateTime' is required\\",\\"'' is required\\",\\"'1.Specimen.type.coding[0].system' is required\\",\\"'1.Specimen.type.coding[0].code' is required\\",\\"'1.Specimen.type.coding[0].display' is required\\",\\"'1.Specimen.collection.collectedDateTime' is required\\",\\"'1.Practitioner.name[0].text' is required\\",\\"'1.Practitioner.qualification[0].identifier[0].{ id=MCR, value }' is required\\",\\"'1.Practitioner.qualification[0].issuer.{ type=Organization, reference }' is required\\",\\"'1.Organization.name' is required\\",\\"'1.Organization.type[0].coding[0].system' is required\\",\\"'1.Organization.type[0].coding[0].code' is required\\",\\"'1.Organization.type[0].coding[0].display' is required\\",\\"'1.Organization.contact[0].telecom[0].{ system=url, value }' is required\\",\\"'1.Organization.contact[0].telecom[1].{ system=phone, value }' is required\\",\\"'1.Organization.contact[0].address.type' is required\\",\\"'1.Organization.contact[0].address.use' is required\\",\\"'1.Organization.contact[0].address.text' is required\\",\\"'Observation.performer[2].{ id=AL, type=Organization, reference }' is required\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
});
