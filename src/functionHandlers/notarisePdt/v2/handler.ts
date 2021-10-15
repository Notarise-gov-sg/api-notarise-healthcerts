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
): Promise<{ result: NotarisationResult; directUrl: string }> => {
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
    result: {
      notarisedDocument,
      ttl,
      url: storedUrl,
    },
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

  /* 1. Validation */
  let parseFhirBundle: Bundle;
  let data: HealthCertDocument;
  let testData: TestData[];
  let documentType: string;
  try {
    await validateV2Inputs(certificate);
    data = getData(certificate);

    // validate basic FhirBundle standard and parse FhirBundle
    parseFhirBundle = fhirHelper.parse(data.fhirBundle as R4.IBundle);

    // validate parsed FhirBundle data with specific healthcert type constraints
    documentType = (data?.type ?? "").toUpperCase();
    fhirHelper.hasRequiredFields(documentType, parseFhirBundle);

    // convert parsed Bundle to testdata[]
    testData = getTestDataFromParseFhirBundle(parseFhirBundle);
  } catch (e) {
    errorWithRef(
      `Error while validating certificate: ${
        e instanceof DetailedCodedError ? `${e.title}, ${e.messageBody}` : e
      }`
    );
    return {
      statusCode: 400,
      headers: {
        "x-trace-id": reference,
      },
      body:
        e instanceof DetailedCodedError
          ? `${e.title}, ${e.messageBody}`
          : String(e),
    };
  }

  /* 2. Endorsement */
  let result: NotarisationResult;
  let directUrl: string;
  try {
    ({ result, directUrl } = await notarisePdt(
      reference,
      certificate,
      parseFhirBundle as Bundle,
      testData as TestData[]
    ));
  } catch (e) {
    errorWithRef(`Unhandled error: ${e instanceof Error ? e.message : e}`);
    return {
      statusCode: 500,
      headers: {
        "x-trace-id": reference,
      },
      body: "",
    };
  }

  /* Send SPM notification to recipient (Only if enabled) */
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
      errorWithRef(
        `SPM notification error: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  /* [NEW] Send HealthCert to SPM wallet (Only if enabled) */
  if (config.healthCertNotification.enabled) {
    try {
      await notifyHealthCert({
        uin: parseFhirBundle.patient?.nricFin || "",
        version: "2.0",
        type: documentType,
        url: directUrl,
        expiry: result.ttl,
      });
    } catch (e) {
      errorWithRef(`SPM wallet error: ${e instanceof Error ? e.message : e}`);
    }
  }

  /* Generate Google Pay COVID Card URL (Only if enabled) */
  if (config.isGPayCovidCardEnabled) {
    try {
      // TODO: Placeholder value. To add actual implementation once KMS is setup.
      result.gpayCovidCardUrl = `https://pay.google.com/gp/v/save/xxx`;
    } catch (e) {
      errorWithRef(
        `GPay COVID Card error: ${e instanceof Error ? e.message : e}`
      );
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
