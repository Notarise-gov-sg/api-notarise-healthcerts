import { R4 } from "@ahryman40k/ts-fhir-types";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { DetailedCodedError } from "../../common/error";
import fhirHelper from "./index";
import exampleHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleArtHealthCertWithNric from "../../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";

const { PdtTypes } = pdtHealthCertV2;

describe("validatePCRHealthCertData", () => {
  test("should pass for valid PCR healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      exampleHealthCertWithNric.fhirBundle as R4.IBundle
    );
    expect(() =>
      fhirHelper.hasRequiredFields(PdtTypes.Pcr, parseFhirBundle)
    ).not.toThrow();
  });
  test("should pass for valid SER healthcert", () => {
    const parseFhirBundle = fhirHelper.parse(
      exampleHealthCertWithNric.fhirBundle as R4.IBundle
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
    expect(thrownError).toEqual(
      `Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: {"observations.0.observation.organizationAlResourceUuid":["Observations 0.observation organization al resource uuid can't be blank"],"observations.0.organization.al.fullName":["Observations 0.organization al full name can't be blank"],"observations.0.organization.al.type":["Observations 0.organization al type can't be blank"],"observations.0.organization.al.url":["Observations 0.organization al url can't be blank"],"observations.0.organization.al.phone":["Observations 0.organization al phone can't be blank"],"observations.0.organization.al.address":["Observations 0.organization al address can't be blank"],"observations.0.organization.al.address.type":["Observations 0.organization al address type can't be blank"],"observations.0.organization.al.address.use":["Observations 0.organization al address use can't be blank"],"observations.0.organization.al.address.text":["Observations 0.organization al address text can't be blank"]}`
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
    expect(thrownError).toEqual(
      `Submitted HealthCert is invalid, the following required fields in fhirBundle are missing: {"observations.0.device.type.system":["Observations 0.device type system can't be blank"],"observations.0.device.type.code":["Observations 0.device type code can't be blank"],"observations.0.device.type.display":["Observations 0.device type display can't be blank"]}`
    );
  });
});
