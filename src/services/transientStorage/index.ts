import { Record, String, Number, Runtype } from "runtypes";
import {
  buildStoredUrl as _buildStoredUrl,
  getQueueNumber as _getQueueNumber,
  uploadDocument as _uploadDocument,
  VERIFY_URL,
} from "@notarise-gov-sg/transient-storage-lib";
import { config } from "../../config";

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
const subDomain =
  process.env.STAGE === "production" ? VERIFY_URL.PROD : VERIFY_URL.STAGING;

// const FailureResponseDef = Record({
//   requestId: String,
//   message: String.Or(Undefined)
// });
// const ResponseDef = Union(SuccessfulResponseDef, FailureResponseDef);
// type FailureResponse = Runtype<typeof SuccessfulResponseDef>;
// type Response = Runtype<typeof ResponseDef>;

export const buildUniversalUrl = _buildStoredUrl.bind(
  null,
  endpoint,
  subDomain
);
export const getQueueNumber = _getQueueNumber.bind(null, endpoint, apiKey);
export const uploadDocument = _uploadDocument.bind(null, endpoint, apiKey);
