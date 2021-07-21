// To add logs to cloudwatch
// Custom middlware: https://github.com/middyjs/middy#configurable-middlewares

import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import middy, { MiddlewareObj } from "@middy/core";
import { NotarisationResult } from "src/functionHandlers/notarisePdt/handler";
import { HealthCertDocument, Observation } from "src/types";
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
  provider = "";

  before = async (req: Request): Promise<void> => {
    const wrappedDocument = req.event
      .body as WrappedDocument<HealthCertDocument>;
    const data = getData(wrappedDocument);
    const provider: string =
      data.issuers[0].identityProof?.location ?? "UNKNOWN";
    this.provider = provider;
    trace(`provider ${provider} attempting to notarise pdt...`);
  };

  after = async (req: Request): Promise<void> => {
    const { body } = req.response;
    try {
      const notarisationResult: NotarisationResult = JSON.parse(body);
      const { notarisedDocument } = notarisationResult;
      const data: HealthCertDocument = getData(notarisedDocument);
      const observation = data.fhirBundle.entry.find(
        (entr) => entr.resourceType === "Observation"
      ) as Observation;
      const testName = observation.code.coding[0].display;
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
