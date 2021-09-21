import { NotarisationResult } from "src/functionHandlers/notarisePdt/handler";
import wrappedDocument from "../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import wrappedDocumentV2 from "../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";
import { CloudWatchMiddleware, Request } from "./cloudWatch";
import * as log from "./trace";

describe("test cloudwatch middleware for v1", () => {
  it.only("middlware should log provider from request", async () => {
    jest.spyOn(log, "trace");
    const request: Request = {
      event: {
        body: wrappedDocument,
      },
      response: null,
    };

    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    await cloudWatchMiddleware.before(request);

    expect(log.trace).toHaveBeenCalledWith(
      "provider donotverify.testing.verify gov.sg attempting to notarise pdt..."
    );
  });

  it("middleware should log cert type from response", async () => {
    jest.spyOn(log, "trace");

    // let's assume the wrappedDocument has been notarized
    const notarisationResult: NotarisationResult = {
      notarisedDocument: wrappedDocument as any,
      ttl: 0,
      url: "",
    };

    const request: Request = {
      event: null,
      response: {
        body: JSON.stringify(notarisationResult),
      },
    };
    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    const provider = "SAMPLE CLINIC";
    cloudWatchMiddleware.provider = provider;
    await cloudWatchMiddleware.after(request);
    expect(log.trace).toHaveBeenCalledWith(
      `${provider} successfully notarised pdt of type pcr`
    );
  });
});

describe("test cloudwatch middleware for v2", () => {
  it("middlware should log provider from request", async () => {
    jest.spyOn(log, "trace");
    const request: Request = {
      event: {
        body: wrappedDocumentV2,
      },
      response: null,
    };

    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    await cloudWatchMiddleware.before(request);

    expect(log.trace).toHaveBeenCalledWith(
      "provider donotverify.testing.verify.gov.sg attempting to notarise pdt..."
    );
  });

  it("middleware should log cert type from response", async () => {
    jest.spyOn(log, "trace");

    // let's assume the wrappedDocumentV2 has been notarized
    const notarisationResult: NotarisationResult = {
      notarisedDocument: wrappedDocumentV2 as any,
      ttl: 0,
      url: "",
    };

    const request: Request = {
      event: null,
      response: {
        body: JSON.stringify(notarisationResult),
      },
    };
    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    const provider = "sample_clinic.river.ai";
    cloudWatchMiddleware.provider = provider;
    await cloudWatchMiddleware.after(request);
    const subDomain = cloudWatchMiddleware.extractSubDomain(provider);
    const clinic = cloudWatchMiddleware.extractClinicName(provider);
    const description = `${clinic} ${subDomain}`.trim();
    expect(log.trace).toHaveBeenCalledWith(
      `${description} successfully notarised pdt of type pcr`
    );
  });
});
