import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { notifyPdt } from "@notarise-gov-sg/sns-notify-recipients";
import { notarise } from "@govtechsg/oa-schemata";
import {
  getTestDataFromHealthCert,
  getParticularsFromHealthCert,
} from "../../models/healthCert";
import { getLogger } from "../../common/logger";
import { DetailedCodedError } from "../../common/error";
import { createNotarizedHealthCert } from "../../models/notarizedHealthCert";
import {
  buildStoredUrl,
  getQueueNumber,
  uploadDocument,
} from "../../services/transientStorage";
import { HealthCertDocument, NotarisationResult } from "../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../middyfy";
import { validateInputs } from "./validateInputs";
import { config, getDefaultIfUndefined } from "../../config";
import {
  createEuSignedTestQr,
  createEuTestCert,
} from "../../models/euHealthCert";

const { trace, error } = getLogger("src/functionHandlers/notarisePdt/handler");

export const notarisePdt = async (
  reference: string,
  certificate: WrappedDocument<HealthCertDocument>
): Promise<NotarisationResult> => {
  const errorWithRef = trace.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  const { id, key } = await getQueueNumber(reference);
  traceWithRef(`placeholder document id: ${id}`);

  const storedUrl = buildStoredUrl(id, key);
  const data = getData(certificate);
  const { nric, fin } = getParticularsFromHealthCert(data);
  const whiteListNrics = getDefaultIfUndefined(process.env.WHITELIST_NRICS, "")
    .split(",")
    .map((nirc) => nirc.trim());
  const patientNricFin = (nric || fin) ?? "";
  traceWithRef(
    `Is offline Qr nric/fin in whitelist : ${whiteListNrics.includes(
      patientNricFin
    )}`
  );
  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
  if (config.isOfflineQrEnabled || whiteListNrics.includes(patientNricFin)) {
    try {
      const testData = getTestDataFromHealthCert(data);
      const testDataTypes = testData.map((test) => test.swabTypeCode);
      if (
        testDataTypes.includes(config.swabTestTypes.ART) ||
        testDataTypes.includes(config.swabTestTypes.PCR)
      ) {
        traceWithRef("signedEuHealthCerts: Generating EU test cert...");
        const euTestCerts = await createEuTestCert(
          testData,
          reference,
          storedUrl
        );
        traceWithRef(euTestCerts);
        signedEuHealthCerts = await createEuSignedTestQr(euTestCerts);
        if (!signedEuHealthCerts.length) {
          throw new Error(
            `Generated EU Vacc Cert is invalid: signedEuHealthCerts has 0 entries`
          );
        }
      } else {
        traceWithRef(
          `signedEuHealthCerts: Unsupported test type - ${JSON.stringify(
            testDataTypes
          )}`
        );
      }
    } catch (e) {
      errorWithRef(
        `signedEuHealthCerts error: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  const notarisedDocument = await createNotarizedHealthCert(
    certificate,
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
      const data = getData(certificate);
      const { nric, fin } = getParticularsFromHealthCert(data);
      const testData = getTestDataFromHealthCert(data);
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
