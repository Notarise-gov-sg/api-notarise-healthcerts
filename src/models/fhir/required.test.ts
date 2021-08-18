import { R4 } from "@ahryman40k/ts-fhir-types";
import fhirHelper from "./index";
import exampleHealthCertWithNric from "../../../test/fixtures/v2/example_healthcert_with_nric_unwrapped.json";
import exampleArtHealthCertWithNric from "../../../test/fixtures/v2/example_art_healthcert_with_nric_unwrapped.json";

describe("validatePCRHealthCertData", () => {
  test("should pass for valid PCR healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      exampleHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields("PCR", parseFhirBundle)
    ).not.toThrow();
  });
  test("should throw error if PCR healthcert not have Accredited Laboratory", () => {
    const parseFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields("PCR", parseFhirBundle)
    ).toThrowError(
      `{"observations.0.observation.organizationAlResourceUuid":["Observations 0.observation organization al resource uuid can't be blank"],"observations.0.organization.al.fullName":["Observations 0.organization al full name can't be blank"],"observations.0.organization.al.type":["Observations 0.organization al type can't be blank"],"observations.0.organization.al.url":["Observations 0.organization al url can't be blank"],"observations.0.organization.al.phone":["Observations 0.organization al phone can't be blank"],"observations.0.organization.al.address":["Observations 0.organization al address can't be blank"],"observations.0.organization.al.address.type":["Observations 0.organization al address type can't be blank"],"observations.0.organization.al.address.use":["Observations 0.organization al address use can't be blank"],"observations.0.organization.al.address.text":["Observations 0.organization al address text can't be blank"]}`
    );
  });
});
describe("validateARTHealthCertData", () => {
  test("should pass for valid ART healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields("ART", parseFhirBundle)
    ).not.toThrow();
  });
  test("should throw error if ART healthcert not have device identifier", () => {
    const malformedHealthCert = exampleArtHealthCertWithNric as any;
    malformedHealthCert.fhirBundle.entry.pop();
    const parseFhirBundle = fhirHelper.parse(
      malformedHealthCert.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields("ART", parseFhirBundle)
    ).toThrowError(
      `{"device.type.system":["Device type system can't be blank"],"device.type.code":["Device type code can't be blank"],"device.type.display":["Device type display can't be blank"]}`
    );
  });
});
