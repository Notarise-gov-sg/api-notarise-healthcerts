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
import { ParsedObservation as ObservationV2 } from "../models/fhir/types";
import { parsers } from "../models/fhir/parse";
import { logError, trace } from "./trace";

// export const { trace } = getLogger("cloudWatchMiddleware");
export type Request = Pick<middy.Request, "event" | "response">;

// Custom middleware must return an obhect of { before?: fn, after?: fn, onError?: fn }
// Note: Do not return a response as
// this will totally stop the execution of successive middlewares in any phase (before, after, onError) and returns an early response
// https://github.com/middyjs/middy#interrupt-middleware-execution-early

export class CloudWatchMiddleware
  implements Pick<MiddlewareObj, "before" | "after">
{
  private provider = "";

  // split "abc.riverr.io" into "riverr.io"
  // searches for final "."
  extractSubDomain(provider: string): string {
    return /\w+\.\w+$/.exec(provider)?.toString() ?? "";
  }

  before = async (req: Request): Promise<void> => {
    const wrappedDocument = req.event
      .body as WrappedDocument<HealthCertDocument>;
    const data = getData(wrappedDocument);
    const provider = data.issuers[0].identityProof?.location ?? "UNKNOWN";
    this.provider = provider;
    const subDomain = this.extractSubDomain(provider);
    trace(`provider ${provider} attempting to notarise pdt...`);
    trace(`subDomain ${subDomain} attempting to notarise pdt...`);
  };

  after = async (req: Request): Promise<void> => {
    const { body } = req.response;
    try {
      const notarisationResult: NotarisationResult = JSON.parse(body);
      const { notarisedDocument } = notarisationResult;
      const data: HealthCertDocument | PDTHealthCertV2Document =
        getData(notarisedDocument);
      let testName = "";
      if (data?.version === "pdt-healthcert-v2.0") {
        // @ts-ignore
        const observationResource = data.fhirBundle.entry?.find(
          (entr: any) => entr.resource.resourceType === "Observation"
        )?.resource;
        const observation = parsers(observationResource) as ObservationV2;
        testName = observation.testType?.display || "";
      } else {
        // @ts-ignore
        const observation = data.fhirBundle.entry?.find(
          (entr: any) => entr.resourceType === "Observation"
        ) as Observation;
        testName = observation.code.coding[0].display;
      }
      const { provider } = this;

      if (/art/i.test(testName)) {
        trace(`${provider} successfully notarised pdt of type art`);
      } else if (/pcr/i.test(testName)) {
        trace(`${provider} successfully notarised pdt of type pcr`);
      }
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
