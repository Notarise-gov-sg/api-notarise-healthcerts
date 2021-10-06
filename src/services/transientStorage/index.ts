import { Record, String, Number, Runtype } from "runtypes";
import axios from "axios";
import { SignedNotarizedHealthCert } from "../../types";
import { config } from "../../config";
import { getLogger } from "../../common/logger";

const { trace } = getLogger("api-notarise-healthcerts");

export const SuccessfulGetQueueNumberResponseDef = Record({
  id: String,
  key: String,
});
export const SuccessfulResponseDef = Record({
  id: String,
  key: String,
  type: String,
  ttl: Number,
});
export type SuccessfulResponse = Runtype<typeof SuccessfulResponseDef>;

const { endpoint, apiKey } = config.transientStorage;

// const FailureResponseDef = Record({
//   requestId: String,
//   message: String.Or(Undefined)
// });
// const ResponseDef = Union(SuccessfulResponseDef, FailureResponseDef);
// type FailureResponse = Runtype<typeof SuccessfulResponseDef>;
// type Response = Runtype<typeof ResponseDef>;

const stringifyAndEncode = (obj: any): string =>
  encodeURIComponent(JSON.stringify(obj));

const universalUrl = (url: string, key: string) => {
  const subDomain = process.env.STAGE === "production" ? "www" : "dev";
  const query = stringifyAndEncode({
    type: "DOCUMENT",
    payload: {
      uri: url,
      permittedActions: ["VIEW", "STORE"],
      redirect: `https://${subDomain}.verify.gov.sg/verify`,
    },
  });
  const anchor = key ? `#${stringifyAndEncode({ key })}` : ``;
  return `https://action.openattestation.com/?q=${query}${anchor}`;
};

export const buildStoredUrl = (id: string, key: string) => {
  const url = `${endpoint}/${id}`;
  return universalUrl(url, key);
};

const universalDirectUrl = (url: string, key: string) => {
  const query = stringifyAndEncode({
    type: "DOCUMENT",
    payload: {
      uri: url,
      permittedActions: ["VIEW", "STORE"],
    },
  });
  const anchor = key ? `#${stringifyAndEncode({ key })}` : ``;
  return `https://www.verify.gov.sg/verify?q=${query}${anchor}`;
};

export const buildStoredDirectUrl = (id: string, key: string) => {
  const url = `${endpoint}/${id}`;
  return universalDirectUrl(url, key);
};

export const getQueueNumber = async (reference: string) => {
  const traceWithRef = trace.extend(`reference:${reference}`);
  traceWithRef("get queue number");
  const { data } = await axios({
    method: "POST",
    url: `${endpoint}/queue-number`,
    headers: {
      "x-api-key": apiKey,
      "x-trace-key": reference,
    },
  });
  const queueNumber = SuccessfulGetQueueNumberResponseDef.check(data);
  traceWithRef(`queueNumber=${queueNumber.id}`);
  return queueNumber;
};

export const uploadDocument = async (
  document: SignedNotarizedHealthCert,
  id: string,
  reference: string
) => {
  const traceWithRef = trace.extend(`reference:${reference}`);
  traceWithRef(`start to upload document to ${id}`);
  const { data } = await axios({
    method: "PUT",
    url: `${endpoint}/${id}`,
    data: { document },
    headers: {
      "x-api-key": apiKey,
      "x-trace-id": reference,
    },
  });
  traceWithRef(`document uploaded at ${id}`);
  const response = SuccessfulResponseDef.check(data);
  return {
    ...response,
  };
};
