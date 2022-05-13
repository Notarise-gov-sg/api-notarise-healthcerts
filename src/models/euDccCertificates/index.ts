import EuDccGenerator, {
  BasicDetails,
  TestingRecord,
} from "@notarise-gov-sg/eu-dcc-generator";
import { notarise, pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import _ from "lodash";
import { serializeError } from "serialize-error";
import { Type } from "../fhir/constraints";
import { GroupedObservation, ParsedBundle } from "../../models/fhir/types";
import { isoToLocaleString } from "../../common/datetime";
import { config, getDefaultIfUndefined } from "../../config";
import { getLogger } from "../../common/logger";
import { CodedError } from "../../common/error";

const { trace } = getLogger("src/models/euDccCertificates");
const { euSigner, testTypes } = config;
const { PdtTypes } = pdtHealthCertV2;

/**
 * @deprecated This function need to remove after we support only MOH recommended Test Type code: PCR[94309-2].
 * Currently, we allowed to generate either PCR[94309-2] or OLD_PCR[94531-1]
 */
const isPcrTestTypeCode = (testTypeCode: string): boolean =>
  testTypeCode === testTypes.PCR || testTypeCode === testTypes.OLD_PCR;

const buildEuDccTestRecord = (
  documentType:
    | pdtHealthCertV2.PdtTypes.Art
    | pdtHealthCertV2.PdtTypes.Pcr
    | pdtHealthCertV2.PdtTypes.Lamp,
  groupedObservation: GroupedObservation
): TestingRecord => {
  const testRecord: TestingRecord = {
    testTypeCode: (documentType === PdtTypes.Art
      ? testTypes.ART
      : testTypes.PCR) as TestingRecord["testTypeCode"], // both PCR and LAMP use same test type code for EU DCC
    collectionDateTime: isoToLocaleString(
      groupedObservation.specimen.collectionDateTime
    ), // I.e. Specimen collection datetime;
    testResultCode: groupedObservation.observation.result
      .code as TestingRecord["testResultCode"], // E.g. "260385009";
    testCenter: groupedObservation.organization.lhp.fullName, // E.g. "MacRitchie Medical Clinic"
    testCountry: "SG", // Currently, we only allowed the test taken from SG
  };

  if (documentType === PdtTypes.Pcr || documentType === PdtTypes.Lamp) {
    testRecord.naatTestName = groupedObservation.observation.testType.display; // test type name for PCR/LAMP test [Nucleic acid amplification with probe detection]
  } else if (documentType === PdtTypes.Art) {
    testRecord.ratTestDeviceCode = groupedObservation.device?.type.code; // test device code for ART test [Rapid immunoassay]
  }
  return testRecord;
};

const genEuDccCertificates = async (
  documentType: Type,
  parsedFhirBundle: ParsedBundle,
  uuid: string,
  storedUrl: string
): Promise<notarise.SignedEuHealthCert[]> => {
  try {
    const traceWithRef = trace.extend(`reference:${uuid}`);
    const publicKey = getDefaultIfUndefined(
      process.env.SIGNING_EU_QR_PUBLIC_KEY,
      ""
    );
    const privateKey = getDefaultIfUndefined(
      process.env.SIGNING_EU_QR_PRIVATE_KEY,
      ""
    );
    const euDccGenerator = EuDccGenerator(publicKey, privateKey, "SG");
    const basicDetails: BasicDetails = {
      reference: uuid,
      issuerName: euSigner.issuer,
      expiryDays: euSigner.expiryDays,
      patientDetails: {
        name: parsedFhirBundle.patient.fullName,
        dateOfBirth: parsedFhirBundle.patient.birthDate,
        meta: {
          reference: uuid,
          notarisedOn: new Date().toISOString(),
          passportNumber: parsedFhirBundle.patient.passportNumber,
          url: storedUrl,
        },
      },
    };

    const testRecords: TestingRecord[] = [];
    // check if single type ART or PCR or LAMP type healthcert
    if (
      _.isString(documentType) &&
      (documentType === PdtTypes.Art ||
        documentType === PdtTypes.Pcr ||
        documentType === PdtTypes.Lamp)
    ) {
      testRecords.push(
        buildEuDccTestRecord(documentType, parsedFhirBundle.observations[0])
      );
    }
    // check if multi type include ART or PCR type healthcert
    else if (
      documentType.includes(PdtTypes.Art) ||
      documentType.includes(PdtTypes.Pcr)
    ) {
      parsedFhirBundle.observations
        // filter out only ART or PCR observation data
        .filter(
          (o) =>
            o.observation.testType.code === testTypes.ART ||
            isPcrTestTypeCode(o.observation.testType.code || "")
        )
        .forEach((groupedObservation) => {
          testRecords.push(
            buildEuDccTestRecord(
              groupedObservation.observation.testType.code === testTypes.ART
                ? PdtTypes.Art
                : PdtTypes.Pcr,
              groupedObservation
            )
          );
        });
    }

    let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
    if (testRecords.length > 0) {
      traceWithRef("signedEuHealthCerts: Generating EU test cert...");
      const payload = euDccGenerator.genEuDcc(basicDetails, testRecords);
      const signedPayload = await euDccGenerator.signPayload(payload);

      // take only ["type", "expiryDateTime", "qr", "appleCovidCardUrl"] for oa-doc signedEuHealthCerts
      signedEuHealthCerts = signedPayload.map(
        (signedTestRecord) =>
          _.pick(signedTestRecord, [
            "type",
            "expiryDateTime",
            "qr",
            "appleCovidCardUrl",
          ]) as notarise.SignedEuHealthCert
      );

      if (!signedEuHealthCerts.length) {
        throw new CodedError(
          "EU_QR_ERROR",
          `signedEuHealthCerts: Generated EU Test Cert is invalid. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
          "Unable to generate EU DCC certificates - (!signedEuHealthCerts.length)"
        );
      }
    } else if (documentType !== PdtTypes.Ser) {
      throw new CodedError(
        "EU_QR_ERROR",
        `signedEuHealthCerts: Unsupported test type - ${JSON.stringify(
          documentType
        )}. For more info, refer to the documentation here: https://github.com/Notarise-gov-sg/api-notarise-healthcerts/wiki`,
        "Unable to generate EU DCC certificates - (documentType !== PdtTypes.Ser)"
      );
    }
    return signedEuHealthCerts;
  } catch (e) {
    throw e instanceof CodedError
      ? e
      : new CodedError(
          "EU_QR_ERROR",
          "unable to generate EU DCC certificates",
          JSON.stringify(serializeError(e))
        );
  }
};

export { genEuDccCertificates };
