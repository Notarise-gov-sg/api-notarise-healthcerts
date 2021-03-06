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

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/v2/handler"
);

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

  let euHealthCertQr: EuHealthCertQr | undefined = {};
  if (config.isOfflineQrEnabled) {
    try {
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
    parseFhirBundle,
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

  let parseFhirBundle: Bundle;
  let data: HealthCertDocument;
  let testData: TestData[];
  try {
    await validateV2Inputs(certificate);
    data = getData(certificate);

    // validate basic FhirBundle standard and parse FhirBundle
    parseFhirBundle = fhirHelper.parse(data.fhirBundle as R4.IBundle);

    // validate parsed FhirBundle data with specific healthcert type constraints
    const documentType = (data?.type ?? "").toUpperCase();
    fhirHelper.hasRequiredFields(
      <"ART" | "PCR" | "SER">documentType,
      parseFhirBundle
    );

    // convert parsed Bundle to testdata[]
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

  /* Notify recipient via SPM (only if enabled) */
  if (config.notification.enabled) {
    try {
      await notifyPdt({
        url: result.url,
        nric: parseFhirBundle.patient?.nricFin,
        passportNumber: parseFhirBundle.patient?.passportNumber,
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
