import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { notifyPdt } from "@notarise-gov-sg/sns-notify-recipients";
import {
  getTestDataFromHealthCert,
  getParticularsFromHealthCert,
} from "../../../models/healthCert";
import { getLogger } from "../../../common/logger";
import { DetailedCodedError } from "../../../common/error";
import {
  HealthCertDocument,
  NotarisationResult,
  TestData,
} from "../../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../../middyfy";
import { validateInputs } from "../validateInputs";
import { config } from "../../../config";
import { notarisePdt } from "./notarisePdt";

const { trace, error: logError } = getLogger(
  "src/functionHandlers/notarisePdt/v1/handler"
);

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<HealthCertDocument>>
): Promise<APIGatewayProxyResult> => {
  trace("config", config);
  const reference = uuid();
  const certificate = event.body;

  // need to extract the nric first as the nric will be masked in place when notarisePdt()
  let data: HealthCertDocument = {} as any;
  let nric: string | undefined;
  let fin: string | undefined;
  let testData: TestData[] = [];

  try {
    data = getData(certificate);
    ({ nric, fin } = getParticularsFromHealthCert(data));
    testData = getTestDataFromHealthCert(data);
  } catch (e) {
    logError(`error extracting data from wrapped document. ${e}`);
  }

  const errorWithRef = logError.extend(`reference:${reference}`);

  try {
    await validateInputs(certificate);

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
      if (result) {
        await notifyPdt({
          url: result.url,
          nric: nric || fin,
          passportNumber: testData[0].passportNumber,
          testData,
          validFrom: data.validFrom,
        });
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
