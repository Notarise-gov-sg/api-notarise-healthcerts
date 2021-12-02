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
import { ParsedBundle } from "../../../models/fhir/types";
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
  PDTHealthCertV2Document,
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
import { genGPayCovidCardUrl } from "../../../models/gpayCovidCard";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/v2/handler"
);

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<PDTHealthCertV2Document>,
  parsedFhirBundle: ParsedBundle,
  testData: TestData[]
): Promise<{ result: NotarisationResult; directUrl: string }> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: ${id}`);

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
    parsedFhirBundle,
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
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<PDTHealthCertV2Document>>
): Promise<APIGatewayProxyResult> => {
  trace("config", config);
  const reference = uuid();
  const wrappedDocument = event.body;
  const errorWithRef = error.extend(`reference:${reference}`);

  /* 1. Validation */
  let parsedFhirBundle: ParsedBundle;
  let data: PDTHealthCertV2Document; // The unwrapped document
  let testData: TestData[];
  try {
    await validateV2Inputs(wrappedDocument);
    data = getData(wrappedDocument);

    // validate basic FhirBundle standard and parse FhirBundle
    parsedFhirBundle = fhirHelper.parse(data.fhirBundle as R4.IBundle);

    // validate parsed FhirBundle data with specific healthcert type constraints
    fhirHelper.hasRequiredFields(data.type, parsedFhirBundle);

    // convert parsed Bundle to testdata[]
    testData = getTestDataFromParseFhirBundle(parsedFhirBundle);
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
      wrappedDocument,
      parsedFhirBundle as ParsedBundle,
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

  /* Send to SPM notification/wallet */
  if (parsedFhirBundle.patient?.nricFin && config.notification.enabled) {
    try {
      const testType =
        testData[0].swabTypeCode === config.swabTestTypes.PCR
          ? "PCR"
          : testData[0].swabTypeCode === config.swabTestTypes.ART
          ? "ART"
          : null;
      if (config.healthCertNotification.enabled && testType) {
        /* [NEW] Send HealthCert to SPM wallet for PCR | ART (Only if enabled) */
        await notifyHealthCert({
          uin: parsedFhirBundle.patient.nricFin,
          version: "2.0",
          type: testType,
          url: directUrl,
          expiry: result.ttl,
        });
      } else {
        /* Send SPM notification to recipient (Only if enabled) */
        await notifyPdt({
          url: result.url,
          nric: parsedFhirBundle.patient.nricFin,
          passportNumber: parsedFhirBundle.patient?.passportNumber,
          testData,
          validFrom: data.validFrom,
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        errorWithRef(`SPM notification/wallet error: ${e.message}`);
      }
    }
  }

  /* Generate Google Pay COVID Card URL (Only if enabled) */
  if (config.isGPayCovidCardEnabled) {
    try {
      result.gpayCovidCardUrl = genGPayCovidCardUrl(
        config.gpaySigner,
        parsedFhirBundle,
        reference,
        result.url
      );
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
