// To add logs to cloudwatch
// Custom middlware: https://github.com/middyjs/middy#configurable-middlewares

import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import middy, { MiddlewareObj } from "@middy/core";
import {
  HealthCertDocument,
  NotarisationResult,
  Observation,
  PDTHealthCertV2Document,
} from "../types";
import { logError, trace } from "./trace";

export type Request = Pick<middy.Request, "event" | "response">;

// Custom middleware must return an obhect of { before?: fn, after?: fn, onError?: fn }
// Note: Do not return a response as
// this will totally stop the execution of successive middlewares in any phase (before, after, onError) and returns an early response
// https://github.com/middyjs/middy#interrupt-middleware-execution-early

export class CloudWatchMiddleware
  implements Pick<MiddlewareObj, "before" | "after">
{
  private specificDomain = "";

  // split "abc.riverr.io" into "riverr.io"
  // searches for final "."
  toAggregateDomain(provider: string): string {
    return /\w+\.\w+$/.exec(provider)?.toString() ?? "";
  }

  before = async (req: Request): Promise<void> => {
    const wrappedDocument = req.event
      .body as WrappedDocument<HealthCertDocument>;
    const data = getData(wrappedDocument);
    const provider = data.issuers[0].identityProof?.location ?? "UNKNOWN";
    this.specificDomain = provider;
    const aggregateDomain = this.toAggregateDomain(this.specificDomain);
    trace(
      `specificDomain ${this.specificDomain} attempting to notarise pdt...`
    );
    trace(`aggregateDomain ${aggregateDomain} attempting to notarise pdt...`);
  };

  after = async (req: Request): Promise<void> => {
    const { body, statusCode } = req.response;
    if (statusCode !== 200) {
      logError(
        "error encountered, logging for successful notarisation skipped"
      );
      return;
    }

    try {
      const notarisationResult: NotarisationResult = JSON.parse(body);
      const { notarisedDocument } = notarisationResult;
      const data: HealthCertDocument | PDTHealthCertV2Document =
        getData(notarisedDocument);
      let testType = "";
      const validTestTypes = ["art", "pcr", "ser"];
      if (data?.version === "pdt-healthcert-v2.0") {
        testType = (data.type as string).toLowerCase();
        if (!validTestTypes.includes(testType)) {
          logError(`test type ${testType} is not valid`);
        }
      } else {
        // @ts-ignore
        const observation = data.fhirBundle.entry?.find(
          (entr: any) => entr.resourceType === "Observation"
        ) as Observation;
        let { display } = observation.code.coding[0]; // e.g. Reverse transcription polymerase chain reaction (rRT-PCR) test
        display = display.toLowerCase();
        for (let i = 0; i < validTestTypes.length; i += 1) {
          const validType = validTestTypes[i];
          if (display.includes(validType)) {
            testType = validType;
            break;
          }
        }
      }
      const { specificDomain } = this;
      const aggregateDomain = this.toAggregateDomain(this.specificDomain);
      trace(
        `aggregateDomain ${aggregateDomain} successfully notarised pdt of type ${testType}`
      );
      trace(
        `specificDomain ${specificDomain} successfully notarised pdt of type ${testType}`
      );
    } catch (error) {
      logError(
        "main handler responded with an error, thus could not JSON.parse() the expected healthcert"
      );
    }
  };
}

export const cloudWatchMiddleware = (): Pick<
  MiddlewareObj,
  "before" | "after"
> => new CloudWatchMiddleware();
