import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { notifyPdt } from "@notarise-gov-sg/sns-notify-recipients";
import { R4 } from "@ahryman40k/ts-fhir-types";
import fhirHelper from "../../../models/fhir";
import { Bundle } from "../../../models/fhir/types";
import { getTestDataFromParseFhirBundle } from "../../../models/healthCertV2";
import { getLogger } from "../../../common/logger";
import { createNotarizedHealthCert } from "../../../models/notarizedHealthCertV2";
import {
  buildStoredUrl,
  getQueueNumber,
  uploadDocument,
} from "../../../services/transientStorage";
import { EuHealthCertQr, HealthCertDocument, TestData } from "../../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../../middyfy";
import { validateV2Inputs } from "../validateInputs";
import { config } from "../../../config";
import {
  createEuSignedTestQr,
  createEuTestCert,
} from "../../../models/euHealthCert";

const { trace, error } = getLogger("src/functionHandlers/notarisePdt/handler");

export interface NotarisationResult {
  notarisedDocument: WrappedDocument<HealthCertDocument>;
  ttl: number;
  url: string;
}

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<HealthCertDocument>,
  parseFhirBundle: Bundle,
  testData: TestData[]
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: $id}`);

  const storedUrl = buildStoredUrl(id, key);

  let euHealthCertsInfo: any[] = [];
  if (config.isOfflineQrEnabled) {
    try {
      traceWithRef("EU test cert...");
      const euTestCert = await createEuTestCert(testData, reference, storedUrl);
      traceWithRef(euTestCert);

      traceWithRef("Generating EU test cert qr...");
      const testQrHealthCerts = await createEuSignedTestQr(euTestCert);
      euHealthCertsInfo = testQrHealthCerts.map(
        (testHealthCert: EuHealthCertQr) => testHealthCert.qrData
      );
      traceWithRef(euHealthCertsInfo);

      if (euHealthCertsInfo.length > 0) {
        euHealthCertsInfo.forEach((euHealthCertInfo, index) => {
          traceWithRef(`EU test cert qr ${index + 1} : ${euHealthCertInfo}`);
        });
      }
    } catch (e) {
      errorWithRef(`Offline Qr error: ${e.message}`);
    }
  }

  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
    parseFhirBundle,
    reference,
    storedUrl
  );
  const { ttl } = await uploadDocument(notarisedDocument, id, reference);
  traceWithRef("Document successfully notarised");
  return {
    notarisedDocument,
    ttl,
    url: storedUrl,
  };
};

export const notifySpm = async (
  reference: string,
  validFrom: string,
  testData: TestData[],
  result: NotarisationResult
): Promise<void> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  /* Notify recipient via SPM (only if enabled) */
  if (config.notification.enabled) {
    try {
      await notifyPdt({
        url: result.url,
        nric: testData[0].nric,
        passportNumber: testData[0].passportNumber,
        testData,
        validFrom,
      });
    } catch (e) {
      errorWithRef(`Notification error: ${e.message}`);
    }
  }
};

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<HealthCertDocument>>
): Promise<APIGatewayProxyResult> => {
  trace("config", config);
  const reference = uuid();
  const certificate = event.body;
  const errorWithRef = error.extend(`reference:${reference}`);

  let parseFhirBundle: Bundle;
  let data: HealthCertDocument;
  let testData: TestData[];
  try {
    await validateV2Inputs(certificate);
    data = getData(certificate);

    // ensure that all the required parameters can be read
    parseFhirBundle = fhirHelper.parse(data.fhirBundle as R4.IBundle);

    // convert parseFhirBundle to testdata[] with validation
    testData = getTestDataFromParseFhirBundle(parseFhirBundle);
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
    result = await notarisePdt(
      reference,
      certificate,
      parseFhirBundle,
      testData
    );
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

  await notifySpm(reference, data.validFrom, testData, result);

  return {
    statusCode: 200,
    headers: {
      "x-trace-id": reference,
    },
    body: JSON.stringify(result),
  };
};

export const handler = middyfy(main);
