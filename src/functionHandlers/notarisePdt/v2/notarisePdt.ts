import { WrappedDocument } from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import { ParsedBundle } from "../../../models/fhir/types";
import { getLogger } from "../../../common/logger";
import { createNotarizedHealthCert } from "../../../models/notarizedHealthCertV2";
import {
  buildStoredUrl,
  getQueueNumber,
  uploadDocument,
} from "../../../services/transientStorage";
import { PDTHealthCertV2, NotarisationResult, TestData } from "../../../types";
import { config, getDefaultIfUndefined } from "../../../config";
import {
  createEuSignedTestQr,
  createEuTestCert,
} from "../../../models/euHealthCert";

const { trace } = getLogger("src/functionHandlers/notarisePdt/v2/notarisePdt");

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<PDTHealthCertV2>,
  parsedFhirBundle: ParsedBundle,
  testData: TestData[]
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: ${id}`);

  const storedUrl = buildStoredUrl(id, key);

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
      const testDataTypes = testData.map((test) => test.swabTypeCode);
      if (
        testDataTypes.includes(config.swabTestTypes.ART) ||
        testDataTypes.includes(config.swabTestTypes.PCR)
      ) {
        traceWithRef("signedEuHealthCerts: Generating EU test cert...");
        const euTestCerts = await createEuTestCert(
          testData,
          reference,
          storedUrl
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
          `signedEuHealthCerts: Unsupported test type - ${JSON.stringify(
            testDataTypes
          )}`
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
    storedUrl,
    signedEuHealthCerts
  );
  const { ttl } = await uploadDocument(notarisedDocument, id, reference);
  traceWithRef("Document successfully notarised");
  return {
    notarisedDocument,
    ttl,
    url: storedUrl,
  };
};
