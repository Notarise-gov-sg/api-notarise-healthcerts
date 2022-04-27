import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { serializeError } from "serialize-error";
import { sendNotification } from "../../../services/spmNotification";
import fhirHelper from "../../../models/fhir";
import { ParsedBundle } from "../../../models/fhir/types";
import { getLogger } from "../../../common/logger";
import { hashIC } from "../../../common/hash";
import { PDTHealthCertV2, NotarisationResult } from "../../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../../middyfy";
import { validateV2Inputs } from "../validateInputs";
import { config } from "../../../config";
import { genGPayCovidCardUrl } from "../../../models/gpayCovidCard";
import { notarisePdt } from "./notarisePdt";
import { CodedError } from "../../../common/error";
import {
  getPersonalDataFromVault,
  checkValidPatientName,
} from "../../../services/vault";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/v2/handler"
);

export const main: Handler = async (
  event: ValidatedAPIGatewayProxyEvent<WrappedDocument<PDTHealthCertV2>>
): Promise<APIGatewayProxyResult> => {
  const reference = uuid();
  const wrappedDocument = event.body;
  const errorWithRef = error.extend(`reference:${reference}`);
  const traceWithRef = trace.extend(`reference:${reference}`);

  try {
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
      throw e instanceof CodedError
        ? e
        : new CodedError(
            "INVALID_DOCUMENT",
            "Error while validating certificate",
            JSON.stringify(serializeError(e))
          );
    }

    try {
      /* 1.1 Soft Validation with vault data */
      if (parsedFhirBundle.patient.nricFin) {
        const personalData = await getPersonalDataFromVault(
          hashIC(parsedFhirBundle.patient.nricFin, config.vaultUinSalt),
          reference
        );
        if (personalData) {
          const isDobInVault =
            personalData.dateofbirth === parsedFhirBundle.patient.birthDate;
          const isGenderInVault =
            personalData.gender ===
            parsedFhirBundle.patient.gender?.charAt(0).toUpperCase();
          const isNameInVault = checkValidPatientName(
            parsedFhirBundle.patient.fullName,
            personalData.principalname
          );
          traceWithRef(
            `Vault Data Result : ${JSON.stringify({
              isDobInVault,
              isGenderInVault,
              isNameInVault,
            })}`
          );
        }
      }
    } catch (e) {
      const codedError =
        e instanceof CodedError
          ? e
          : new CodedError(
              "VAULT_DATA_ERROR",
              "Error while validating with vault data",
              JSON.stringify(serializeError(e))
            );
      traceWithRef(codedError.toJSON());
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
      throw e instanceof CodedError
        ? e
        : new CodedError(
            "NOTARISE_PDT_ERROR",
            "Unable to Notarise document(s)",
            JSON.stringify(serializeError(e))
          );
    }

    /* Send to SPM notification/wallet (Only if enabled) */
    if (config.notification.enabled) {
      try {
        await sendNotification(result, parsedFhirBundle, data);
      } catch (e) {
        throw e instanceof CodedError
          ? e
          : new CodedError(
              "SPM_NOTIFICATION_ERROR",
              "SPM notification/wallet error - unable to send notification",
              JSON.stringify(serializeError(e))
            );
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
        throw e instanceof CodedError
          ? e
          : new CodedError(
              "GPAY_COVID_CARD_ERROR",
              "GPay COVID Card error - unable to generate Google Pay COVID Card URL",
              JSON.stringify(serializeError(e))
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
  } catch (e) {
    let codedError: CodedError;
    if (e instanceof CodedError) {
      codedError = e;
    } else {
      codedError = new CodedError(
        "UNKNOWN_ERROR",
        "Unable to notarise document",
        JSON.stringify(serializeError(e))
      );
    }

    errorWithRef(codedError.toString());
    return codedError.toResponse(reference);
  }
};

export const handler = middyfy(main);
