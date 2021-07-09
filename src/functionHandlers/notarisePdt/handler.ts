import { APIGatewayProxyResult, Handler } from "aws-lambda";
import createError from "http-errors";
import { v4 as uuid } from "uuid";
import {
  getData,
  validateSchema,
  WrappedDocument,
} from "@govtechsg/open-attestation";
import { notifyPdt } from "@notarise-gov-sg/sns-notify-recipients";
import APIGateway from "aws-sdk/clients/apigateway";
import { apig } from "src/services/apiGateway";
import {
  getTestDataFromHealthCert,
  getParticularsFromHealthCert,
} from "../../models/healthCert";
import { getLogger } from "../../common/logger";
import { createNotarizedHealthCert } from "../../models/notarizedHealthCert";
import {
  buildStoredUrl,
  getQueueNumber,
  uploadDocument,
} from "../../services/transientStorage";
import { HealthCertDocument, Observation } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { validateInputs } from "./validateInputs";
import { config } from "../../config";

const { trace, error } = getLogger("src/functionHandlers/notarisePdt/handler");

export interface NotarisationResult {
  notarisedDocument: WrappedDocument<HealthCertDocument>;
  ttl: number;
  url: string;
}

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<HealthCertDocument>
): Promise<NotarisationResult> => {
  const traceWithRef = trace.extend(`reference:${reference}`);
  const { id, key } = await getQueueNumber(reference);
  const storedUrl = await buildStoredUrl(id, key);
  traceWithRef(`URL for certificate: ${storedUrl}`);
  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
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

  /* Notify recipient via SPM (only if enabled) */
  if (config.notification.enabled) {
    try {
      const data = getData(certificate);
      const { nric, fin } = getParticularsFromHealthCert(data);
      const testData = getTestDataFromHealthCert(data);
      await notifyPdt({
        url: result.url,
        nric: nric || fin,
        passportNumber: testData[0].passportNumber,
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

let provider: string;

export const handler = middyfy(main)
  .before(async (req) => {
    const { body } = req.event;
    if (!body || !validateSchema(body)) {
      throw new createError.BadRequest("Body must be a wrapped health cert");
    }

    // Log the aws gateway api key for the purpose of cloudwatch log
    // to record breakdown per Provider per Month
    const header = req.event.headers;
    const X_API_KEY = header["x-api-key"] as string;

    const promiseResult = await apig.getApiKeys().promise();
    const apiKeyObjs = promiseResult.$response.data
      ?.items as APIGateway.ListOfApiKey;
    const apiKeyObj = apiKeyObjs.find((key) => key.value === X_API_KEY);
    if (apiKeyObj != null) {
      provider = apiKeyObj.name as string;
      trace(`provider ${provider} attempting to notarise pdt...`);
    }
  })
  .after(async (req) => {
    const { body } = req.event;
    const notarisationResult: NotarisationResult = JSON.parse(body);
    const observation =
      notarisationResult.notarisedDocument.data.fhirBundle.entry.find(
        (ent) => ent.resourceType === "Observation"
      ) as Observation;
    const testName = observation.code.coding[0].display;
    if (/art/i.test(testName)) {
      trace(`${provider} successfully notarised pdt of type art`);
    } else if (/pcr/i.test(testName)) {
      trace(`${provider} successfully notarised pdt of type pcr`);
    }
  });
