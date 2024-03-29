// To add logs to cloudwatch
// Custom middlware: https://github.com/middyjs/middy#configurable-middlewares

import { getData, WrappedDocument } from "@govtechsg/open-attestation";
import middy, { MiddlewareObj } from "@middy/core";
import { NotarisationResult, PDTHealthCertV2 } from "../types";
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

  private validTests = ["pcr", "art", "ser", "lamp"];

  // split "abc.riverr.io" into "riverr.io"
  // searches for final "."
  toAggregateDomain(provider: string): string {
    return /\w+\.\w+$/.exec(provider)?.toString() ?? "";
  }

  before = async (req: Request): Promise<void> => {
    const wrappedDocument = req.event.body as WrappedDocument<PDTHealthCertV2>;
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
      logError("error encountered, logging for cloudwatch skipped");
      return;
    }

    try {
      const notarisationResult: NotarisationResult = JSON.parse(body);
      const { notarisedDocument } = notarisationResult;
      const data: PDTHealthCertV2 = getData(notarisedDocument);
      let testTypes: string[] = [];
      if (data.version === "pdt-healthcert-v2.0") {
        // version 2
        testTypes = this.extractTestTypesV2(data as PDTHealthCertV2);
      }
      const { specificDomain } = this;
      const aggregateDomain = this.toAggregateDomain(specificDomain);
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

  // version 2
  private extractTestTypesV2(data: PDTHealthCertV2): string[] {
    let testTypes: string[] = [];
    if (typeof data.type === "string") {
      testTypes = [data.type];
    } else if (Array.isArray(data.type)) {
      testTypes = data.type;
    }
    for (let i = 0; i < testTypes.length; i += 1) {
      testTypes[i] = testTypes[i].toLowerCase();
      if (!this.validTests.includes(testTypes[i])) {
        testTypes[i] = `UNRECOGNISED: ${testTypes[i]}`;
      }
    }
    return testTypes;
  }
}

export const cloudWatchMiddleware = (): Pick<
  MiddlewareObj,
  "before" | "after"
> => new CloudWatchMiddleware();
