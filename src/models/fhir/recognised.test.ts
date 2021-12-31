import { R4 } from "@ahryman40k/ts-fhir-types";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { DetailedCodedError } from "../../common/error";
import fhirHelper from "./index";
import exampleSingleTypeHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleMultiTypeHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_ser_multi_result_unwrapped.json";

const { PdtTypes } = pdtHealthCertV2;

describe("recognised fields", () => {
  test("should throw error if single type HealthCert has an invalid test result code", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      exampleSingleTypeHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].observation.result.code = "foobar";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof DetailedCodedError) {
        thrownError = `${e.title}, ${e.messageBody}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'0.Observation.valueCodeableConcept.coding[0].code' is an unrecognised code - please use of the following codes: 10828004,260385009,260373001,260415000\\"]. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38"`
    );
  });

  test("should throw error if multi type HealthCert has an invalid test result code", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      exampleMultiTypeHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[1].observation.result.code = "foobar";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Art, parsedFhirBundle);
    } catch (e) {
      if (e instanceof DetailedCodedError) {
        thrownError = `${e.title}, ${e.messageBody}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'1.Observation.valueCodeableConcept.coding[0].code' is an unrecognised code - please use of the following codes: 10828004,260385009,260373001,260415000\\"]. For more info, refer to the mapping table here: https://github.com/Open-Attestation/schemata/pull/38"`
    );
  });
});
