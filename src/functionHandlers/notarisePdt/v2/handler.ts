import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { sendNotification } from "../../../services/spmNotification";
import fhirHelper from "../../../models/fhir";
import { ParsedBundle } from "../../../models/fhir/types";
import { getLogger } from "../../../common/logger";
import { DetailedCodedError } from "../../../common/error";
import { PDTHealthCertV2, NotarisationResult } from "../../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../../middyfy";
import { validateV2Inputs } from "../validateInputs";
import { config } from "../../../config";
import { genGPayCovidCardUrl } from "../../../models/gpayCovidCard";
import { notarisePdt } from "./notarisePdt";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/v2/handler"
);

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<PDTHealthCertV2>>
): Promise<APIGatewayProxyResult> => {
  trace("config", config);
  const reference = uuid();
  const wrappedDocument = event.body;
  const errorWithRef = error.extend(`reference:${reference}`);

  /* 1. Validation */
  let parsedFhirBundle: ParsedBundle;
  let data: PDTHealthCertV2; // The unwrapped HealthCert
  try {
    await validateV2Inputs(wrappedDocument);
    data = getData(wrappedDocument);

    // validate basic FhirBundle standard and parse FhirBundle
    parsedFhirBundle = fhirHelper.parse(data.fhirBundle as R4.IBundle);

    // validate parsed FhirBundle data with specific healthcert type constraints
    fhirHelper.hasRequiredFields(data.type, parsedFhirBundle);
    fhirHelper.hasRecognisedFields(data.type, parsedFhirBundle);
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
  try {
    result = await notarisePdt(
      reference,
      wrappedDocument,
      data.type,
      parsedFhirBundle as ParsedBundle
    );
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

  /* Send to SPM notification/wallet (Only if enabled) */
  if (config.notification.enabled) {
    try {
      await sendNotification(result, parsedFhirBundle, data);
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
