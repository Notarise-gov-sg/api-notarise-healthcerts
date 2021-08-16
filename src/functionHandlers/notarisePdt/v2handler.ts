import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { getTestDataFromHealthCert } from "../../models/healthCert";
import { getLogger } from "../../common/logger";
import { HealthCertDocument } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { validateV2Inputs } from "./validateInputs";
import { config } from "../../config";
import { NotarisationResult, notarisePdt, notifySpm } from "./handler";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/v2handler"
);

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<HealthCertDocument>>
): Promise<APIGatewayProxyResult> => {
  trace("config", config);
  const reference = uuid();
  const certificate = event.body;

  const errorWithRef = error.extend(`reference:${reference}`);

  try {
    await validateV2Inputs(certificate);
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

  await notifySpm(reference, certificate, result);

  return {
    statusCode: 200,
    headers: {
      "x-trace-id": reference,
    },
    body: JSON.stringify(result),
  };
};

export const handler = middyfy(main);
