import { R4 } from "@ahryman40k/ts-fhir-types";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { CodedError } from "../../common/error";
import fhirHelper from "./index";
import exampleArtHealthCertWithNric from "../../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";
import examplePcrHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleMultiTypeHealthCertWithNric from "../../../test/fixtures/v2/pdt_pcr_ser_multi_result_unwrapped.json";

const { PdtTypes } = pdtHealthCertV2;

describe("PCR: Recognised/accepted values", () => {
  test("should pass if single type HealthCert has missing NRIC-FIN", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );

    try {
      parsedFhirBundle.patient.nricFin = "";
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
      delete parsedFhirBundle.patient.nricFin;
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
  });

  test("should pass if multi type HealthCert has missing NRIC-FIN", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      exampleMultiTypeHealthCertWithNric.fhirBundle as R4.IBundle
    );

    try {
      parsedFhirBundle.patient.nricFin = "";
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
      delete parsedFhirBundle.patient.nricFin;
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
  });

  test("should throw error if single type HealthCert has an invalid NRIC-FIN checksum", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.patient.nricFin = "S9098989Z";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'Patient.identifier[1].{ id=NRIC-FIN, value }' value has an invalid NRIC-FIN checksum\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });

  test("should pass if single type HealthCert has an valid iso birthDate", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.patient.birthDate = "2018-04-04T16:00:00.000Z";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
  });

  test("should pass if single type HealthCert has an valid YYYY-MM birthDate", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.patient.birthDate = "2018-04";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
  });

  test("should pass if single type HealthCert has an valid YYYY-MM-DD effectiveDateTime", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].observation.effectiveDateTime =
      "2018-04-12";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
  });

  test("should pass if single type HealthCert has an valid partial iso effectiveDateTime", () => {
    let thrownError;
    const fhirBundle = examplePcrHealthCertWithNric.fhirBundle as any;
    fhirBundle.entry[1].resource.effectiveDateTime = "2018-04-04TABC";
    const parsedFhirBundle = fhirHelper.parse(fhirBundle as R4.IBundle);
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
    expect(
      parsedFhirBundle.observations[0].observation.effectiveDateTime
    ).toStrictEqual("2018-04-04T00:00:00Z");
  });

  test("should pass if single type HealthCert has an valid YYYY-MM-DD specimen collectionDateTime", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].specimen.collectionDateTime = "2018-04-12";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
  });

  test("should pass if single type HealthCert has an valid partial iso specimen collectionDateTime", () => {
    let thrownError;
    const fhirBundle = examplePcrHealthCertWithNric.fhirBundle as any;
    fhirBundle.entry[2].resource.collection.collectedDateTime =
      "2018-04-04TABC";
    const parsedFhirBundle = fhirHelper.parse(fhirBundle as R4.IBundle);
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toBe(undefined);
    expect(
      parsedFhirBundle.observations[0].specimen.collectionDateTime
    ).toStrictEqual("2018-04-04T00:00:00Z");
  });

  test("should throw error if single type HealthCert has an invalid birthDate", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.patient.birthDate = "17 Feb 2021";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'Patient.birthDate' value is invalid. Use YYYY-MM-DD or YYYY-MM or YYYY or ISO-8601 format\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });

  test("should throw error if single type HealthCert has an invalid test result code", () => {
    let thrownError;
    const parsedFhirBundle = fhirHelper.parse(
      examplePcrHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].observation.result.code = "foobar";
    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Pcr, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'0.Observation.valueCodeableConcept.coding[0].code' is an unrecognised test result code - please use one of the following codes: 10828004,260385009,260373001,260415000\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
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
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'1.Observation.valueCodeableConcept.coding[0].code' is an unrecognised test result code - please use one of the following codes: 10828004,260385009,260373001,260415000\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
});

describe("ART: Recognised/accepted values", () => {
  test("should throw error if ART healthcert has unrecognised modality", () => {
    let thrownError;

    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].observation.modality = "foobar";

    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Art, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'0.Observation.note[n].{ id=MODALITY, text }' is an unrecognised modality value - please use one of the following values: Administered,Supervised,Remotely Supervised\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
  test("should throw error if ART healthcert has unrecognised test specimen collectionDateTime", () => {
    let thrownError;

    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].specimen.collectionDateTime =
      "12 Feb 2022";

    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Art, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'0.Specimen.collection.collectedDateTime' value is invalid. Use YYYY-MM-DD or ISO-8601 format\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
  test("should throw error if ART healthcert has unrecognised test effectiveDateTime", () => {
    let thrownError;

    const parsedFhirBundle = fhirHelper.parse(
      exampleArtHealthCertWithNric.fhirBundle as R4.IBundle
    );
    parsedFhirBundle.observations[0].observation.effectiveDateTime =
      "12 Feb 2022";

    try {
      fhirHelper.hasRecognisedFields(PdtTypes.Art, parsedFhirBundle);
    } catch (e) {
      if (e instanceof CodedError) {
        thrownError = `${e.message}`;
      }
    }
    expect(thrownError).toMatchInlineSnapshot(
      `"Submitted HealthCert is invalid, the following fields in fhirBundle are not recognised: [\\"'0.Observation.effectiveDateTime' value is invalid. Use YYYY-MM-DD or ISO-8601 format\\"]. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki"`
    );
  });
});
