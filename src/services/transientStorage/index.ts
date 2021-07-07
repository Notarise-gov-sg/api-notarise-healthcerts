import { Record, String, Number, Runtype } from "runtypes";
import axios from "axios";
import { SignedNotarizedHealthCert } from "../../types";
import { config } from "../../config";
import { getLogger } from "../../common/logger";

const { trace, info } = getLogger("transientStorage");

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

const universalUrl = (url: string, key: string) => {
  const query = encodeURIComponent(
    JSON.stringify({
      type: "DOCUMENT",
      payload: {
        uri: url,
        key,
        permittedActions: ["VIEW", "STORE"],
        redirect: "https://www.verify.gov.sg/verify",
      },
    })
  );
  return `https://action.openattestation.com/?q=${query}`;
};

export const buildStoredUrl = (id: string, key: string) => {
  const url = `${endpoint}/${id}`;
  return universalUrl(url, key);
};

export const getQueueNumber = async (reference: string) => {
  trace("get queue number");
  const url = `${endpoint}/queue-number`;
  trace(`url: ${url}`);
  const { data } = await axios({
    method: "POST",
    url,
    headers: {
      "x-api-key": apiKey,
      "x-trace-key": reference,
    },
  });
  trace("after");
  const queueNumber = SuccessfulGetQueueNumberResponseDef.check(data);
  info(`queueNumber=${queueNumber.id}`);
  return queueNumber;
};

export const uploadDocument = async (
  document: SignedNotarizedHealthCert,
  id: string,
  reference: string
) => {
  trace(`start to upload document to ${id}`);
  const { data } = await axios({
    method: "PUT",
    url: `${endpoint}/${id}`,
    data: { document },
    headers: {
      "x-api-key": apiKey,
      "x-trace-key": reference,
    },
  });
  trace(`document uploaded at ${id}`);
  const response = SuccessfulResponseDef.check(data);
  return {
    ...response,
  };
};
