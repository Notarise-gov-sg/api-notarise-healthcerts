import { notifyHealthCert } from "@notarise-gov-sg/sns-notify-recipients";
import _ from "lodash";
import moment from "moment-timezone";
import { ParsedBundle } from "../../models/fhir/types";
import { config } from "../../config";
import { NotarisationResult, PDTHealthCertV2 } from "../../types";

const isChildPatient = (parsedFhirBundle: ParsedBundle): boolean => {
  const patientDOB = parsedFhirBundle.patient.birthDate;
  return moment().diff(patientDOB, "years") < 15;
};

export const sendNotification = async (
  result: NotarisationResult,
  parsedFhirBundle: ParsedBundle,
  certificateData: PDTHealthCertV2
) => {
  /* Send SPM notification using api-notify/wallet when patient is adult (15 years & above) and present NRIC-FIN in OA-Doc. */
  if (parsedFhirBundle.patient?.nricFin && !isChildPatient(parsedFhirBundle)) {
    /*
     * [NEW] Send HealthCert to SPM wallet for PCR | ART | SER | LAMP or multi-type ['PCR', 'SER'] (Only if enabled).
     */
    if (config.healthCertNotification.enabled) {
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
    }
  }
};
