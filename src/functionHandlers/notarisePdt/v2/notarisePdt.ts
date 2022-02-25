import { WrappedDocument } from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import { ParsedBundle } from "../../../models/fhir/types";
import { getLogger } from "../../../common/logger";
import { createNotarizedHealthCert } from "../../../models/notarizedHealthCertV2";
import {
  buildUniversalUrl,
  getQueueNumber,
  uploadDocument,
} from "../../../services/transientStorage";
import { PDTHealthCertV2, NotarisationResult } from "../../../types";
import { config, getDefaultIfUndefined } from "../../../config";
import { Type } from "../../../models/fhir/constraints";
import { genEuDccCertificates } from "../../../models/euDccCertificates";

const { trace } = getLogger("src/functionHandlers/notarisePdt/v2/notarisePdt");

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<PDTHealthCertV2>,
  type: Type,
  parsedFhirBundle: ParsedBundle
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  /* Get transientStorage queue number for upload and build verify url. */
  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: ${id}`);
  const universalUrl = buildUniversalUrl(id, key);

  /* Get whitelisted nrics from SSM for enable some limited features in Prod. */
  const whiteListNrics = getDefaultIfUndefined(process.env.WHITELIST_NRICS, "")
    .split(",")
    .map((nirc) => nirc.trim());
  const patientNricFin = parsedFhirBundle.patient.nricFin ?? "";
  const isWhitelistedNric = patientNricFin
    ? whiteListNrics.includes(patientNricFin)
    : false;
  traceWithRef(`Is offline Qr nric/fin in whitelist : ${isWhitelistedNric}`);

  /* Generate EU Test Health Cert (Only if enabled or Match with whitelisted NRIC) */
  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
  if (config.isOfflineQrEnabled || isWhitelistedNric) {
    try {
      signedEuHealthCerts = await genEuDccCertificates(
        type,
        parsedFhirBundle,
        reference,
        universalUrl
      );
    } catch (e) {
      errorWithRef(
        `signedEuHealthCerts error: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  /* Generate notarised Test Health Cert Document and Upload to transientStorage bucket. */
  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
    parsedFhirBundle,
    reference,
    universalUrl,
    signedEuHealthCerts
  );
  const { ttl } = await uploadDocument(notarisedDocument, id, reference);
  traceWithRef("Document successfully notarised");
  return {
    notarisedDocument,
    ttl,
    url: universalUrl,
  };
};
