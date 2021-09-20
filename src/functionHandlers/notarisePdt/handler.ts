import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import {
  notifyPdt,
  notifyHealthCert,
} from "@notarise-gov-sg/sns-notify-recipients";
import { notarise } from "@govtechsg/oa-schemata";
import {
  getTestDataFromHealthCert,
  getParticularsFromHealthCert,
} from "../../models/healthCert";
import { getLogger } from "../../common/logger";
import { DetailedCodedError } from "../../common/error";
import { createNotarizedHealthCert } from "../../models/notarizedHealthCert";
import {
  buildStoredUrl,
  getQueueNumber,
  buildStoredDirectUrl,
  uploadDocument,
} from "../../services/transientStorage";
import { HealthCertDocument, NotarisationResult } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { validateInputs } from "./validateInputs";
import { config } from "../../config";
import {
  createEuSignedTestQr,
  createEuTestCert,
} from "../../models/euHealthCert";

const { trace, error } = getLogger("src/functionHandlers/notarisePdt/handler");

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<HealthCertDocument>
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: $id}`);

  const directUrl = buildStoredDirectUrl(id, key);
  const storedUrl = buildStoredUrl(id, key);

  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
  if (config.isOfflineQrEnabled) {
    try {
      const data = getData(certificate);
      const testData = getTestDataFromHealthCert(data);

      traceWithRef("EU test cert...");
      const euTestCerts = await createEuTestCert(
        testData,
        reference,
        storedUrl
      );
      traceWithRef(euTestCerts);

      traceWithRef("Generating EU test cert qr...");
      signedEuHealthCerts = await createEuSignedTestQr(euTestCerts);
      if (!signedEuHealthCerts.length) {
        throw new Error("Invalid EU vacc cert generated");
      }
    } catch (e) {
      if (e instanceof Error) {
        errorWithRef(`Offline Qr error: ${e.message}`);
      }
    }
  }

  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
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
    directUrl,
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
    if (e instanceof DetailedCodedError) {
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
  }

  let result: NotarisationResult | undefined;

  try {
    result = await notarisePdt(reference, certificate);
  } catch (e) {
    if (e instanceof Error) {
      errorWithRef(`Unhandled error: ${e.message}`);
      return {
        statusCode: 500,
        headers: {
          "x-trace-id": reference,
        },
        body: "",
      };
    }
  }

  /* Notify recipient via SPM (only if enabled) */
  if (config.notification.enabled) {
    try {
      const data = getData(certificate);
      const { nric, fin } = getParticularsFromHealthCert(data);
      const testData = getTestDataFromHealthCert(data);
      if (result) {
        const testType =
          testData[0].swabTypeCode === config.swabTestTypes.PCR
            ? "PCR"
            : testData[0].swabTypeCode === config.swabTestTypes.ART
            ? "ART"
            : null;
        if (config.healthCertNotification.enabled && testType) {
          await notifyHealthCert({
            version: "1.0",
            type: testType,
            url: result.directUrl,
            expiry: result.ttl,
          });
        } else {
          await notifyPdt({
            url: result.url,
            nric: nric || fin,
            passportNumber: testData[0].passportNumber,
            testData,
            validFrom: data.validFrom,
          });
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        errorWithRef(`Notification error: ${e.message}`);
      }
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
