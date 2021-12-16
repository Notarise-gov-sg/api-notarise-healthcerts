import { cloneDeep } from "lodash";
import { NotarisationResult } from "../types";
import wrappedDocumentV1 from "../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import wrappedDocumentV2 from "../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";
import { CloudWatchMiddleware, Request } from "./cloudWatch";
import * as log from "./trace";

it("test regex of extractSubDomain", () => {
  const cloudWatchMiddleware: CloudWatchMiddleware = new CloudWatchMiddleware();
  expect(cloudWatchMiddleware.toAggregateDomain("abc@river.ai")).toBe(
    "river.ai"
  );
  expect(
    cloudWatchMiddleware.toAggregateDomain("donotverify.testing.verify.gov.sg")
  ).toBe("gov.sg");
});

describe("test cloudwatch middleware for v1", () => {
  it("middlware should log clinic and subdomain from request", async () => {
    jest.spyOn(log, "trace");
    const request: Request = {
      event: {
        body: wrappedDocumentV1,
      },
      response: null,
    };

    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    await cloudWatchMiddleware.before(request);

    expect(log.trace).toHaveBeenCalledWith(
      "specificDomain donotverify.testing.verify.gov.sg attempting to notarise pdt..."
    );
    expect(log.trace).toHaveBeenCalledWith(
      "aggregateDomain gov.sg attempting to notarise pdt..."
    );
  });

  it("middleware should log cert type from response", async () => {
    jest.spyOn(log, "trace");

    // let's assume the wrappedDocument has been notarized
    const notarisationResult: NotarisationResult = {
      notarisedDocument: wrappedDocumentV1 as any,
      ttl: 0,
      url: "",
    };

    const request: Request = {
      event: {
        body: wrappedDocumentV2,
      },
      response: {
        body: JSON.stringify(notarisationResult),
        statusCode: 200,
      },
    };
    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    await cloudWatchMiddleware.before(request);
    await cloudWatchMiddleware.after(request);
    expect(log.trace).toHaveBeenCalledWith(
      `specificDomain donotverify.testing.verify.gov.sg successfully notarised pdt of type pcr`
    );
    // expect(log.trace).toHaveBeenCalledWith(
    //   `aggregateDomain gov.sg successfully notarised pdt of type pcr`
    // );
  });
});

describe("test cloudwatch middleware for v2", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("middlware should log clinic and subdomain from request", async () => {
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
      "specificDomain donotverify.testing.verify.gov.sg attempting to notarise pdt..."
    );
  });

  it("middleware should log cert type from response", async () => {
    jest.spyOn(log, "trace");
    const doc = cloneDeep(wrappedDocumentV2);
    doc.data.type = ["pcr", "ser"] as any;

    // let's assume the wrappedDocumentV2 has been notarized
    const notarisationResult: NotarisationResult = {
      notarisedDocument: doc as any,
      ttl: 0,
      url: "",
    };

    const request: Request = {
      event: {
        body: doc,
      },
      response: {
        body: JSON.stringify(notarisationResult),
        statusCode: 200,
      },
    };
    const cloudWatchMiddleware: CloudWatchMiddleware =
      new CloudWatchMiddleware();
    await cloudWatchMiddleware.before(request);
    await cloudWatchMiddleware.after(request);
    expect(log.trace).toHaveBeenCalledWith(
      `aggregateDomain gov.sg successfully notarised pdt of type pcr, ser`
    );
    expect(log.trace).toHaveBeenCalledWith(
      `specificDomain donotverify.testing.verify.gov.sg successfully notarised pdt of type pcr, ser`
    );
  });
});
