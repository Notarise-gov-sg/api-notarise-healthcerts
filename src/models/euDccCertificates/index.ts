import EuDccGenerator, {
  BasicDetails,
  TestingRecord,
} from "@notarise-gov-sg/eu-dcc-generator";
import { notarise, pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import _ from "lodash";
import { Type } from "../fhir/constraints";
import { ParsedBundle } from "../../models/fhir/types";
import { isoToDateOnlyString, isoToLocaleString } from "../../common/datetime";
import { config, getDefaultIfUndefined } from "../../config";
import { getLogger } from "../../common/logger";

const { trace } = getLogger("src/models/euDccCertificates");
const { euSigner, testTypes } = config;

const genEuDccCertificates = async (
  type: Type,
  parsedFhirBundle: ParsedBundle,
  uuid: string,
  storedUrl: string
): Promise<notarise.SignedEuHealthCert[]> => {
  const traceWithRef = trace.extend(`reference:${uuid}`);
  const { PdtTypes } = pdtHealthCertV2;
  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];

  if (
    (_.isString(type) && (type === PdtTypes.Art || type === PdtTypes.Pcr)) ||
    type.includes(PdtTypes.Art) ||
    type.includes(PdtTypes.Pcr)
  ) {
    traceWithRef("signedEuHealthCerts: Generating EU test cert...");

    const publicKey = getDefaultIfUndefined(
      process.env.SIGNING_EU_QR_PUBLIC_KEY,
      ""
    );
    const privateKey = getDefaultIfUndefined(
      process.env.SIGNING_EU_QR_PRIVATE_KEY,
      ""
    );
    const euDccGenerator = EuDccGenerator(
      publicKey,
      privateKey,
      euSigner.issuer
    );
    const basicDetails: BasicDetails = {
      reference: uuid,
      issuerName: euSigner.issuer,
      expiryDays: euSigner.expiryDays,
      patientDetails: {
        name: parsedFhirBundle.patient.fullName,
        dateOfBirth: isoToDateOnlyString(parsedFhirBundle.patient.birthDate),
        meta: {
          reference: uuid,
          notarisedOn: new Date().toISOString(),
          passportNumber: parsedFhirBundle.patient.passportNumber,
          url: storedUrl,
        },
      },
    };

    // Map the test type code from single healthcert oa-doc type
    let testTypeCode: string;
    if (type === PdtTypes.Art) {
      testTypeCode = testTypes.ART;
    } else if (type === PdtTypes.Pcr) {
      testTypeCode = testTypes.PCR;
    }

    let testRecords: TestingRecord[] = parsedFhirBundle.observations.map(
      (o) => {
        const testRecord: TestingRecord = {
          testTypeCode:
            testTypeCode ??
            (o.observation.testType.code as TestingRecord["testTypeCode"]), // take observations' test type code if oa-doc have multiple types like [PCR, SER]
          collectionDateTime: isoToLocaleString(o.specimen.collectionDateTime), // I.e. Specimen collection datetime;
          testResultCode: o.observation.result
            .code as TestingRecord["testResultCode"], // E.g. "260385009";
          testCenter: o.organization.lhp.fullName, // E.g. "MacRitchie Medical Clinic"
          testCountry: "SG", // Currently, we only allowed the test taken from SG
        };

        if (o.observation.testType.code === testTypes.PCR) {
          testRecord.naatTestName = o.observation.testType.display; // test type for PCR test [Nucleic acid amplification with probe detection]
        } else if (o.observation.testType.code === testTypes.ART) {
          testRecord.ratTestDeviceCode = o.device?.type.code; // test device code for ART test [Rapid immunoassay]
        }
        return testRecord;
      }
    );
    // filter out the other test records except PCR and ART test type
    testRecords = testRecords.filter(
      (testRecord) => testRecord.naatTestName || testRecord.ratTestDeviceCode
    );

    const payload = euDccGenerator.genEuDcc(basicDetails, testRecords);
    const signedPayload = await euDccGenerator.signPayload(payload);

    // take only ["type", "expiryDateTime", "qr"] for oa-doc signedEuHealthCerts
    signedEuHealthCerts = signedPayload.map(
      (signedTestRecord) =>
        _.pick(signedTestRecord, [
          "type",
          "expiryDateTime",
          "qr",
        ]) as notarise.SignedEuHealthCert
    );

    if (!signedEuHealthCerts.length) {
      throw new Error(
        `Generated EU Vacc Cert is invalid: signedEuHealthCerts has 0 entries`
      );
    }
  } else {
    traceWithRef(
      `signedEuHealthCerts: Unsupported test type - ${JSON.stringify(type)}`
    );
  }
  return signedEuHealthCerts;
};

export { genEuDccCertificates };
