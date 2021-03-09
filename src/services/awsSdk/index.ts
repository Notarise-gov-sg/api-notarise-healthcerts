/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/**
 * Doing weird shit with require() and type defs because aws-xray-sdk
 * has broken typedefs that are due to be fixed soon
 * https://github.com/aws/aws-xray-sdk-node/issues/276
 */
const AWSXRay = require("aws-xray-sdk-core");
export const AWS = process.env.IS_OFFLINE
  ? require("aws-sdk")
  : AWSXRay.captureAWS(require("aws-sdk"));
