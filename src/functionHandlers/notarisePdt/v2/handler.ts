import { APIGatewayProxyResult, Handler } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { serializeError } from "serialize-error";
import { sendSlackNotification } from "../../../models/sendSlackNotification";
import { sendNotification } from "../../../services/spmNotification";
import fhirHelper from "../../../models/fhir";
import { ParsedBundle } from "../../../models/fhir/types";
import { getLogger } from "../../../common/logger";
import {
  PDTHealthCertV2,
  NotarisationResult,
  WorkflowReferenceData,
  WorkflowContextData,
} from "../../../types";
import { middyfy, ValidatedAPIGatewayProxyEvent } from "../../middyfy";
import { validateV2Inputs } from "../validateInputs";
import { config } from "../../../config";
import { genGPayCovidCardUrl } from "../../../models/gpayCovidCard";
import { notarisePdt } from "./notarisePdt";
import { CodedError } from "../../../common/error";
import { getDemographics } from "../../../services/vault";

const { error, trace } = getLogger(
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

    const dateFormatter = new Intl.DateTimeFormat("en-SG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });
    const currentDateEpoch = Date.now();
    const currentDateStr = dateFormatter.format(currentDateEpoch);
    const context = {
      reference,
      receivedTimestamp: currentDateStr,
    } as WorkflowContextData & WorkflowReferenceData;

    try {
      /* 1.1 Soft Validation with vault data */
      if (parsedFhirBundle.patient.nricFin) {
        const personalData = await getDemographics(
          parsedFhirBundle.patient.nricFin,
          reference
        );
        const dob = parsedFhirBundle.patient.birthDate;
        const gender = parsedFhirBundle.patient.gender?.charAt(0).toUpperCase();
        let isDobAndGenderInVault = false;

        personalData?.vaultData.forEach((vault) => {
          if (vault.dateofbirth === dob && vault.gender === gender) {
            isDobAndGenderInVault = true;
            traceWithRef(`Dob and gender match with vault data`);
          }
        });

        personalData?.manualData.forEach((manual) => {
          if (manual.dateofbirth === dob && manual.gender === gender) {
            isDobAndGenderInVault = true;
            traceWithRef(`Dob and gender match with notarise manual data`);
          }
        });

        if (!isDobAndGenderInVault) {
          const clinicName = parsedFhirBundle.observations[0].organization.al;
          const vaultErr = new CodedError(
            "VAULT_DATA_ERROR",
            "Date of birth or gender do not match existing records. Please try again with the correct values. If the problem persists, please submit supporting documents to support@notarise.gov.sg",
            `Clinic Name: ${clinicName},Input dob: ${dob}, input gender: ${gender}`
          );
          sendSlackNotification(vaultErr, context);
          throw vaultErr;
        }

        // if (personalData) {
        //   const isDobInVault =
        //     personalData.dateofbirth === parsedFhirBundle.patient.birthDate;
        //   const isGenderInVault =
        //     personalData.gender ===
        //     parsedFhirBundle.patient.gender?.charAt(0).toUpperCase();
        //   const isNameInVault = checkValidPatientName(
        //     parsedFhirBundle.patient.fullName,
        //     personalData.principalname
        //   );
        //   traceWithRef(
        //     `Vault Data Result : ${JSON.stringify({
        //       isDobInVault,
        //       isGenderInVault,
        //       isNameInVault,
        //     })}`
        //   );
        // }
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
