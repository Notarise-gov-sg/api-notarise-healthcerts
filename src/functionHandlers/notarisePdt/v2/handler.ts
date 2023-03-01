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
import { getDemographics } from "../../../services/vault";
import { parseDateWithoutZeroes } from "../../../common/datetime";

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

    // const dateFormatter = new Intl.DateTimeFormat("en-SG", {
    //   weekday: "short",
    //   day: "numeric",
    //   month: "short",
    //   year: "numeric",
    //   hour: "numeric",
    //   minute: "numeric",
    //   second: "numeric",
    //   timeZone: "Asia/Singapore",
    // });
    // const currentDateEpoch = Date.now();
    // const currentDateStr = dateFormatter.format(currentDateEpoch);
    // const context = {
    //   reference,
    //   receivedTimestamp: currentDateStr,
    // } as WorkflowContextData & WorkflowReferenceData;

    try {
      /* 1.1 Validation with vault data via api-resident */
      if (parsedFhirBundle.patient.nricFin) {
        const personalData = await getDemographics(
          parsedFhirBundle.patient.nricFin,
          reference
        );
        const dob = parsedFhirBundle.patient.birthDate;
        const gender = parsedFhirBundle.patient.gender?.charAt(0).toUpperCase();
        let isDobAndGenderInVault =
          (personalData?.vaultData.length === 0 &&
            personalData?.manualData.length === 0) ||
          personalData === null;

        personalData?.vaultData.forEach((vault) => {
          const parsedDob = parseDateWithoutZeroes(vault.dateofbirth);

          // check if parsed resulted in year only, if yes then append month and date
          // so trying to match input PDT 00-00 or 01-01
          const matchRelaxedDate =
            parsedDob.length === 4 &&
            `${parsedDob}-01-01` === dob &&
            `${parsedDob}-00-00` === dob;

          traceWithRef(
            `request dob : ${dob}, vault-dob: ${vault.dateofbirth}, parsed dob : ${parsedDob}, relaxDateMatch : ${matchRelaxedDate}`
          );

          if (
            (parsedDob === dob || matchRelaxedDate) &&
            vault.gender === gender
          ) {
            isDobAndGenderInVault = true;
            traceWithRef(`Dob and gender match with vault data`);

            if (matchRelaxedDate) {
              parsedFhirBundle.patient.birthDate = parsedDob;
            }
          }
        });

        personalData?.manualData.forEach((manual) => {
          const parsedDob = parseDateWithoutZeroes(manual.dateofbirth);

          // check if parsed resulted in year only, if yes then append month and date
          // so trying to match input PDT 00-00 or 01-01
          const matchRelaxedDate =
            parsedDob.length === 4 &&
            `${parsedDob}-01-01` === dob &&
            `${parsedDob}-00-00` === dob;

          traceWithRef(
            `MANUAL request dob : ${dob}, vault-dob: ${manual.dateofbirth}, parsed dob : ${parsedDob}, relaxDateMatch : ${matchRelaxedDate}`
          );

          if (
            (parsedDob === dob || matchRelaxedDate) &&
            manual.gender === gender
          ) {
            isDobAndGenderInVault = true;
            traceWithRef(`Dob and gender match with notarise manual data`);

            if (matchRelaxedDate) {
              parsedFhirBundle.patient.birthDate = parsedDob;
            }
          }
        });

        if (!isDobAndGenderInVault) {
          const clinicName =
            parsedFhirBundle.observations[0].organization.lhp.fullName;
          const vaultErr = new CodedError(
            "VAULT_DATA_NOT_FOUND",
            "Date of birth and/or gender do not match existing records. Please try again with the correct values. If the problem persists, please submit supporting documents to support@notarise.gov.sg",
            `Clinic Name: ${clinicName}, Input dob: ${dob}, input gender: ${gender}`
          );
          // await sendSlackNotification(vaultErr, context);
          throw vaultErr;
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
      throw e;
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
