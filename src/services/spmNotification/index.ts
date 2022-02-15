import {
  notifyHealthCert,
  notifyPdt,
} from "@notarise-gov-sg/sns-notify-recipients";
import _ from "lodash";
import moment from "moment-timezone";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { ParsedBundle } from "../../models/fhir/types";
import { config } from "../../config";
import { NotarisationResult, TestData, PDTHealthCertV2 } from "../../types";
import { getTestDataFromParseFhirBundle } from "../../models/healthCertV2";

const { PdtTypes } = pdtHealthCertV2;

const isChildPatient = (parsedFhirBundle: ParsedBundle): boolean => {
  const patientDOB = parsedFhirBundle.patient.birthDate;
  return moment().diff(patientDOB, "years") < 15;
};

const isEligibleForSpmWallet = (certificateData: PDTHealthCertV2): boolean => {
  const supportedSingleTypes = [PdtTypes.Pcr, PdtTypes.Art];
  /* 
  [NEW] SPM wallet notification support only for; 
    - single type OA-Doc PCR or ART (currently, doesn't support either single-type 'SER' or multi-type ['PCR', 'SER'].)
  */
  return (
    _.isString(certificateData.type) &&
    supportedSingleTypes.some((t) => t === certificateData.type)
  );
};

export const sendNotification = async (
  result: NotarisationResult,
  parsedFhirBundle: ParsedBundle,
  certificateData: PDTHealthCertV2
) => {
  /* Send SPM notification using api-notify/wallet when patient is adult (15 years & above) and present NRIC-FIN in OA-Doc. */
  if (parsedFhirBundle.patient?.nricFin && !isChildPatient(parsedFhirBundle)) {
    /* [NEW] Send HealthCert to SPM wallet for PCR | ART (Only if enabled) */
    if (
      config.healthCertNotification.enabled &&
      isEligibleForSpmWallet(certificateData)
    ) {
      await notifyHealthCert({
        uin: parsedFhirBundle.patient?.nricFin,
        version: "2.0",
        type: certificateData.type as string,
        url: result.url,
        expiry: result.ttl,
      });
    } else {
      /* Send SPM notification to recipient (Only if enabled) */
      const testData: TestData[] =
        getTestDataFromParseFhirBundle(parsedFhirBundle);
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
