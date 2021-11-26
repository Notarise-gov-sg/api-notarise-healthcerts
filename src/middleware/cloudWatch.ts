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
      let testTypes: string[] = [];
      const validTestTypes = ["art", "pcr", "ser"];
      if (data.version === "pdt-healthcert-v2.0") {
        // version 2
        if (typeof data.type === "string") {
          testTypes = [data.type];
        } else if (Array.isArray(data.type)) {
          testTypes = data.type;
        }
        testTypes = testTypes.map((test) => test.toLowerCase());
        const allValid: boolean = testTypes.every((test) =>
          validTestTypes.includes(test)
        );
        if (!allValid) {
          logError(`${testTypes.join(", ")} are not valid`);
        }
      } else {
        // version 1
        // @ts-ignore
        const observations = data.fhirBundle?.entry as Observation[];
        const observation = observations.find(
          (entr: any) => entr.resourceType === "Observation"
        ) as Observation;
        let { display } = observation.code.coding[0]; // e.g. Reverse transcription polymerase chain reaction (rRT-PCR) test
        display = display.toLowerCase();
        testTypes = validTestTypes
          .filter((test) => display.includes(test))
          .map((test) => test.toLowerCase());
      }
      const { specificDomain } = this;
      const aggregateDomain = this.toAggregateDomain(specificDomain);
      testTypes.sort();
      trace(
        `aggregateDomain ${aggregateDomain} successfully notarised pdt of type ${testTypes.join(
          ", "
        )}`
      );
      trace(
        `specificDomain ${specificDomain} successfully notarised pdt of type ${testTypes.join(
          ", "
        )}`
      );
    } catch (error) {
      logError(
        "main handler responded with an error, thus could not JSON.parse() on the expected healthcert"
      );
    }
  };
}

export const cloudWatchMiddleware = (): Pick<
  MiddlewareObj,
  "before" | "after"
> => new CloudWatchMiddleware();
