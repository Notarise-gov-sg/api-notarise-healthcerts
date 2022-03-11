import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { serializeError } from "serialize-error";
import { sendNotification } from "../../../services/spmNotification";
import fhirHelper from "../../../models/fhir";
import { ParsedBundle } from "../../../models/fhir/types";
import { getLogger } from "../../../common/logger";
import { PDTHealthCertV2, NotarisationResult } from "../../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../../middyfy";
import { validateV2Inputs } from "../validateInputs";
import { config } from "../../../config";
import { genGPayCovidCardUrl } from "../../../models/gpayCovidCard";
import { notarisePdt } from "./notarisePdt";
import { CodedError } from "../../../common/error";

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
    const codedError = new CodedError(
      "UNKNOWN_ERROR",
      "Error while validating certificate",
      JSON.stringify(serializeError(e))
    );
    errorWithRef(codedError.toString());
    return {
      statusCode: 400,
      headers: {
        "x-trace-id": reference,
      },
      body: codedError.toString(),
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
    const codedError =
      e instanceof CodedError
        ? e
        : new CodedError(
            "UNKNOWN_ERROR",
            "Unable to Notarise document(s)",
            JSON.stringify(serializeError(e))
          );
    errorWithRef(codedError.toString());
    return {
      statusCode: 500,
      headers: {
        "x-trace-id": reference,
      },
      body: codedError.toString(),
    };
  }

  /* Send to SPM notification/wallet (Only if enabled) */
  if (config.notification.enabled) {
    try {
      await sendNotification(result, parsedFhirBundle, data);
    } catch (e) {
      const codedError =
        e instanceof CodedError
          ? e
          : new CodedError(
              "UNKNOWN_ERROR",
              "SPM notification/wallet error",
              JSON.stringify(serializeError(e))
            );
      errorWithRef(codedError.toString());
      return {
        statusCode: 500,
        headers: {
          "x-trace-id": reference,
        },
        body: codedError.toString(),
      };
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
      const codedError =
        e instanceof CodedError
          ? e
          : new CodedError(
              "UNKNOWN_ERROR",
              "GPay COVID Card error",
              JSON.stringify(serializeError(e))
            );
      errorWithRef(codedError.toString());
      return {
        statusCode: 500,
        headers: {
          "x-trace-id": reference,
        },
        body: codedError.toString(),
      };
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
