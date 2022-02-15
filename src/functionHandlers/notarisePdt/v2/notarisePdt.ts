import { WrappedDocument } from "@govtechsg/open-attestation";
import { notarise, pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import _ from "lodash";
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
import {
  createEuSignedTestQr,
  createEuTestCert,
} from "../../../models/euHealthCert";
import { Type } from "../../../models/fhir/constraints";

const { trace } = getLogger("src/functionHandlers/notarisePdt/v2/notarisePdt");

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<PDTHealthCertV2>,
  type: Type,
  parsedFhirBundle: ParsedBundle
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: ${id}`);

  const universalUrl = buildUniversalUrl(id, key);

  const whiteListNrics = getDefaultIfUndefined(process.env.WHITELIST_NRICS, "")
    .split(",")
    .map((nirc) => nirc.trim());
  const patientNricFin = parsedFhirBundle.patient.nricFin ?? "";
  traceWithRef(
    `Is offline Qr nric/fin in whitelist : ${whiteListNrics.includes(
      patientNricFin
    )}`
  );
  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
  if (config.isOfflineQrEnabled || whiteListNrics.includes(patientNricFin)) {
    try {
      const { PdtTypes } = pdtHealthCertV2;
      if (
        (_.isString(type) && type === PdtTypes.Art) ||
        type === PdtTypes.Pcr ||
        type.includes(PdtTypes.Art) ||
        type.includes(PdtTypes.Pcr)
      ) {
        traceWithRef("signedEuHealthCerts: Generating EU test cert...");
        const euTestCerts = await createEuTestCert(
          parsedFhirBundle,
          reference,
          universalUrl
        );
        traceWithRef(euTestCerts);
        signedEuHealthCerts = await createEuSignedTestQr(euTestCerts);
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
    } catch (e) {
      errorWithRef(
        `signedEuHealthCerts error: ${e instanceof Error ? e.message : e}`
      );
    }
  }

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
