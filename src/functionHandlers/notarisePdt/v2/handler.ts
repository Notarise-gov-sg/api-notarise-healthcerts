import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import {
  notifyHealthCert,
  notifyPdt,
} from "@notarise-gov-sg/sns-notify-recipients";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { notarise } from "@govtechsg/oa-schemata";
import fhirHelper from "../../../models/fhir";
import { Bundle } from "../../../models/fhir/types";
import { getTestDataFromParseFhirBundle } from "../../../models/healthCertV2";
import { getLogger } from "../../../common/logger";
import { DetailedCodedError } from "../../../common/error";
import { createNotarizedHealthCert } from "../../../models/notarizedHealthCertV2";
import {
  buildStoredDirectUrl,
  buildStoredUrl,
  getQueueNumber,
  uploadDocument,
} from "../../../services/transientStorage";
import {
  HealthCertDocument,
  NotarisationResult,
  TestData,
} from "../../../types";
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

  const directUrl = buildStoredDirectUrl(id, key);
  const storedUrl = buildStoredUrl(id, key);

  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
  if (config.isOfflineQrEnabled) {
    try {
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
    parseFhirBundle,
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

  let parseFhirBundle: Bundle | undefined;
  let data: HealthCertDocument | undefined;
  let testData: TestData[] | undefined;
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
    result = await notarisePdt(
      reference,
      certificate,
      parseFhirBundle as Bundle,
      testData as TestData[]
    );
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
      if (result && parseFhirBundle && testData && data) {
        const testType =
          testData[0].swabTypeCode === config.swabTestTypes.PCR
            ? "PCR"
            : testData[0].swabTypeCode === config.swabTestTypes.ART
            ? "ART"
            : null;
        if (
          config.healthCertNotification.enabled &&
          testType &&
          result.directUrl
        ) {
          await notifyHealthCert({
            version: "2.0",
            type: testType,
            url: result.directUrl,
            expiry: result.ttl,
          });
          delete result.directUrl;
        } else {
          await notifyPdt({
            url: result.url,
            nric: parseFhirBundle.patient?.nricFin,
            passportNumber: parseFhirBundle.patient?.passportNumber,
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
