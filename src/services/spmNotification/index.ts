import {
  notifyHealthCert,
  notifyPdt,
} from "@notarise-gov-sg/sns-notify-recipients";
import _ from "lodash";
import moment from "moment-timezone";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { TestData } from "@notarise-gov-sg/sns-notify-recipients/dist/types";
import { ParsedBundle } from "../../models/fhir/types";
import { config } from "../../config";
import { NotarisationResult, PDTHealthCertV2 } from "../../types";
import { parseDateTime } from "../../common/datetime";

const { PdtTypes } = pdtHealthCertV2;

const isChildPatient = (parsedFhirBundle: ParsedBundle): boolean => {
  const patientDOB = parsedFhirBundle.patient.birthDate;
  return moment().diff(patientDOB, "years") < 15;
};

/**
 * @deprecated This function need to remove after SPM successfully release 'SER' or multi-type ['PCR', 'SER'] support in Prod.
 * Currently, SPM released 'SER' or multi-type ['PCR', 'SER'] support only in Staging
 */
const isEligibleForSpmWallet = (certificateData: PDTHealthCertV2): boolean => {
  const supportedSingleTypes = [PdtTypes.Pcr, PdtTypes.Art];
  /* 
  [NEW] SPM wallet notification support only for; 
    - single type OA-Doc PCR or ART (currently, doesn't support either single-type 'SER' or multi-type ['PCR', 'SER'] in Prod.)
  */
  return (
    (_.isString(certificateData.type) &&
      supportedSingleTypes.some((t) => t === certificateData.type)) ||
    process.env.STAGE !== "production"
  );
};

const getTestDataForNofityPdt = (
  parsedFhirBundle: ParsedBundle
): TestData[] => {
  const testData: TestData[] = [];
  parsedFhirBundle.observations.forEach((observationGroup) => {
    const testDataValue: TestData = {
      patientName: parsedFhirBundle.patient?.fullName,
      swabCollectionDate: parseDateTime(
        observationGroup.specimen.collectionDateTime
      ),
      testType: observationGroup.observation.testType?.display || "",
      testResult: observationGroup.observation.result.display || "",
    };
    testData.push(testDataValue);
  });
  return testData;
};

export const sendNotification = async (
  result: NotarisationResult,
  parsedFhirBundle: ParsedBundle,
  certificateData: PDTHealthCertV2
) => {
  /* Send SPM notification using api-notify/wallet when patient is adult (15 years & above) and present NRIC-FIN in OA-Doc. */
  if (parsedFhirBundle.patient?.nricFin && !isChildPatient(parsedFhirBundle)) {
    /*
     * [NEW] Send HealthCert to SPM wallet for PCR | ART | SER or multi-type ['PCR', 'SER'] (Only if enabled).
     * [NEW] `LAMP` type HealthCert isn't support yet for SPM notification.
     */
    if (
      config.healthCertNotification.enabled &&
      certificateData.type !== PdtTypes.Lamp &&
      isEligibleForSpmWallet(certificateData)
    ) {
      const certificateType = _.isString(certificateData.type)
        ? certificateData.type
        : certificateData.type.join("_");
      await notifyHealthCert({
        uin: parsedFhirBundle.patient?.nricFin,
        version: "2.0",
        type: certificateType as string,
        url: result.url,
        expiry: result.ttl,
      });
    } else {
      /* Send SPM notification to recipient (Only if enabled) */
      const testData: TestData[] = getTestDataForNofityPdt(parsedFhirBundle);
      await notifyPdt({
        url: result.url,
        nric: parsedFhirBundle.patient?.nricFin,
        passportNumber: parsedFhirBundle.patient?.passportNumber,
        testData,
        validFrom: certificateData.validFrom,
      });
    }
  }
};
