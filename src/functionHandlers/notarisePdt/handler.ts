import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { notifyPdt } from "@notarise-gov-sg/sns-notify-recipients";
import {
  getTestDataFromHealthCert,
  getParticularsFromHealthCert,
} from "../../models/healthCert";
import { getLogger } from "../../common/logger";
import { createNotarizedHealthCert } from "../../models/notarizedHealthCert";
import {
  buildStoredUrl,
  getQueueNumber,
  uploadDocument,
} from "../../services/transientStorage";
import { EuHealthCertQr, HealthCertDocument } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { validateInputs } from "./validateInputs";
import { config } from "../../config";
import {
  createEuSignedTestQr,
  createEuTestCert,
} from "../../models/euHealthCert";

const { trace, error } = getLogger("src/functionHandlers/notarisePdt/handler");

export interface NotarisationResult {
  notarisedDocument: WrappedDocument<HealthCertDocument>;
  ttl: number;
  url: string;
}

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<HealthCertDocument>
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: $id}`);

  const storedUrl = buildStoredUrl(id, key);

  let euHealthCertQr: EuHealthCertQr | undefined = {};
  if (config.isOfflineQrEnabled) {
    try {
      const data = getData(certificate);
      const testData = getTestDataFromHealthCert(data);

      traceWithRef("EU test cert...");
      const euTestCert = await createEuTestCert(testData, reference, storedUrl);
      traceWithRef(euTestCert);

      traceWithRef("Generating EU test cert qr...");
      euHealthCertQr = await createEuSignedTestQr(euTestCert);
      if (euHealthCertQr?.qrData) {
        traceWithRef(`EU test cert qr : ${euHealthCertQr?.qrData}`);
      }
    } catch (e) {
      errorWithRef(`Offline Qr error: ${e.message}`);
    }
  }

  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
    reference,
    storedUrl,
    euHealthCertQr
  );
  const { ttl } = await uploadDocument(notarisedDocument, id, reference);
  traceWithRef("Document successfully notarised");
  return {
    notarisedDocument,
    ttl,
    url: storedUrl,
  };
};

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<HealthCertDocument>>
): Promise<APIGatewayProxyResult> => {
  trace("config", config);
  const reference = uuid();
  const certificate = event.body;

  const errorWithRef = error.extend(`reference:${reference}`);

  try {
    await validateInputs(certificate);
    const data = getData(certificate);

    // ensure that all the required parameters can be read
    getTestDataFromHealthCert(data);
  } catch (e) {
    errorWithRef(
      `Error while validating certificate: ${e.title}, ${e.messageBody}`
    );
    return {
      statusCode: 400,
      headers: {
        "x-trace-id": reference,
      },
      body: `${e.title}, ${e.messageBody}`,
    };
  }

  let result: NotarisationResult;

  try {
    result = await notarisePdt(reference, certificate);
  } catch (e) {
    errorWithRef(`Unhandled error: ${e.message}`);
    return {
      statusCode: 500,
      headers: {
        "x-trace-id": reference,
      },
      body: "",
    };
  }

  /* Notify recipient via SPM (only if enabled) */
  if (config.notification.enabled) {
    try {
      const data = getData(certificate);
      const { nric, fin } = getParticularsFromHealthCert(data);
      const testData = getTestDataFromHealthCert(data);
      await notifyPdt({
        url: result.url,
        nric: nric || fin,
        passportNumber: testData[0].passportNumber,
        testData,
        validFrom: data.validFrom,
      });
    } catch (e) {
      errorWithRef(`Notification error: ${e.message}`);
    }
  }

  return {
    statusCode: 200,
    headers: {
      "x-trace-id": reference,
    },
    body: JSON.stringify(result),
  };
};

export const handler = middyfy(main);
