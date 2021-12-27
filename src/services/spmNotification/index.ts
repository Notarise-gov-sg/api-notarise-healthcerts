import {
  notifyHealthCert,
  notifyPdt,
} from "@notarise-gov-sg/sns-notify-recipients";
import _ from "lodash";
import moment from "moment-timezone";
import { ParsedBundle } from "../../models/fhir/types";
import { config } from "../../config";
import { NotarisationResult, TestData } from "../../types";

const isChildPatient = (parsedFhirBundle: ParsedBundle): boolean => {
  const patientDOB = parsedFhirBundle.patient.birthDate;
  return moment().diff(patientDOB, "years") < 15;
};

const isEligibleForSpmWallet = (parsedFhirBundle: ParsedBundle): boolean => {
  const testTypeCode =
    parsedFhirBundle.observations[0].observation.testType.code || "";
  /* 
  [NEW] SPM wallet notification support only for; 
    - single type OA-Doc PCR or ART (currently, doesn't support either single-type 'SER' or multi-type ['PCR', 'SER'].)
  */
  return (
    parsedFhirBundle.observations.length === 1 &&
    Object.values(config.swabTestTypes).includes(testTypeCode)
  );
};

export const sendNotification = async (
  result: NotarisationResult,
  parsedFhirBundle: ParsedBundle,
  testData: TestData[],
  validFrom: string
) => {
  /* Send SPM notification using api-notify/wallet when patient is adult (15 years & above) and present NRIC-FIN in OA-Doc. */
  if (parsedFhirBundle.patient?.nricFin && !isChildPatient(parsedFhirBundle)) {
    /* [NEW] Send HealthCert to SPM wallet for PCR | ART (Only if enabled) */
    if (
      config.healthCertNotification.enabled &&
      isEligibleForSpmWallet(parsedFhirBundle)
    ) {
      const testType =
        _.findKey(
          config.swabTestTypes,
          (swabTestType) =>
            swabTestType ===
            parsedFhirBundle.observations[0].observation.testType.code
        ) || "";
      await notifyHealthCert({
        uin: parsedFhirBundle.patient?.nricFin,
        version: "2.0",
        type: testType,
        url: result.url,
        expiry: result.ttl,
      });
    } else {
      /* Send SPM notification to recipient (Only if enabled) */
      await notifyPdt({
        url: result.url,
        nric: parsedFhirBundle.patient?.nricFin,
        passportNumber: parsedFhirBundle.patient?.passportNumber,
        testData,
        validFrom,
      });
    }
  }
};
