import { APIGatewayProxyResult, Handler } from "aws-lambda";
import createError from "http-errors";
import uuid from "uuid/v4";
import QrCode from "qrcode";
import {
  getData,
  validateSchema,
  WrappedDocument
} from "@govtechsg/open-attestation";
import { notifyRecipient } from "@notarise-gov-sg/sns-notify-recipients";
import {
  getTestDataFromHealthCert,
  getParticularsFromHealthCert
} from "../../models/healthCert";
import { getLogger } from "../../common/logger";
import { createNotarizedHealthCert } from "../../models/notarizedHealthCert";
import {
  buildStoredUrl,
  getQueueNumber,
  uploadDocument
} from "../../services/transientStorage";
import { HealthCertDocument } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { validateInputs } from "./validateInputs";

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
  const { id, key } = await getQueueNumber();
  const storedUrl = await buildStoredUrl(id, key);
  traceWithRef(`URL for certificate: ${storedUrl}`);
  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
    reference,
    storedUrl
  );
  const { ttl } = await uploadDocument(notarisedDocument, id);
  traceWithRef("Document successfully notarised");
  return {
    notarisedDocument,
    ttl,
    url: storedUrl
  };
};

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<HealthCertDocument>>
): Promise<APIGatewayProxyResult> => {
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
        "x-trace-id": reference
      },
      body: `${e.title}, ${e.messageBody}`
    };
  }

  let result;

  try {
    result = await notarisePdt(reference, certificate);
  } catch (e) {
    errorWithRef(`Unhandled error: ${e.message}`);
    return {
      statusCode: 500,
      headers: {
        "x-trace-id": reference
      },
      body: ""
    };
  }

  try {
    /* Notify recipient via SPM */
    const data = getData(certificate);
    const { nric } = getParticularsFromHealthCert(data);
    const testData = getTestDataFromHealthCert(data);
    const qrCode = await QrCode.toBuffer(result.url);
    await notifyRecipient({
      url: result.url,
      qrCode: `data:image/png;base64, ${qrCode.toString("base64")}`,
      nric,
      passportNumber: testData[0].passportNumber,
      testData,
      validFrom: data.validFrom
    });
  } catch (e) {
    errorWithRef(`Notification error: ${e.message}`);
  }

  return {
    statusCode: 200,
    headers: {
      "x-trace-id": reference
    },
    body: JSON.stringify(result)
  };
};

export const handler = middyfy(main).before(({ event: { body } }, next) => {
  if (!body || !validateSchema(body)) {
    throw new createError.BadRequest("Body must be a wrapped health cert");
  }
  next();
});
