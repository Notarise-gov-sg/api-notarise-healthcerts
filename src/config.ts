import AWS from "aws-sdk";

const isTruthy = (val?: string) => {
  return val === "true" || val === "True";
};

// this function exists because serverless gives a string of "undefined" for unpopulated values
// https://github.com/serverless/serverless/issues/3491
const getDefaultIfUndefined = (
  envVar: string | undefined,
  defaultValue: string
) => {
  return !envVar || envVar === "undefined" ? defaultValue : envVar;
};

const getTransientStorageConfig = () => ({
  endpoint: getDefaultIfUndefined(process.env.TRANSIENT_STORAGE_URL, ""),
  apiKey: getDefaultIfUndefined(process.env.TRANSIENT_STORAGE_API_KEY, "")
});

const getDidSigner = () => ({
  name: getDefaultIfUndefined(process.env.SIGNING_DID_NAME, ""),
  dns: getDefaultIfUndefined(process.env.SIGNING_DNS_DID_LOCATION, ""),
  id: getDefaultIfUndefined(process.env.SIGNING_DID, ""),
  key: getDefaultIfUndefined(process.env.SIGNING_DID_KEY, ""),
  privateKey: getDefaultIfUndefined(process.env.SIGNING_DID_PRIVATE_KEY, "")
});

const getSnsConfig = () =>
  process.env.IS_OFFLINE
    ? {
        region: getDefaultIfUndefined(process.env.SNS_REGION, "ap-southeast-1"),
        endpoint: new AWS.Endpoint("http://localhost:4566"),
        accessKeyId: "S3RVER",
        secretAccessKey: "S3RVER"
      }
    : {
        region: getDefaultIfUndefined(process.env.SNS_REGION, "ap-southeast-1")
      };

const generateConfig = () => ({
  documentName: "HealthCert",
  isOffline: isTruthy(process.env.IS_OFFLINE),
  transientStorage: getTransientStorageConfig(),
  didSigner: getDidSigner(),
  env: process.env.NODE_ENV,
  network: getDefaultIfUndefined(process.env.ETHEREUM_NETWORK, "ropsten"),
  isValidationEnabled: !(
    process.env.IS_OFFLINE || process.env.IDENTIFIER_VALIDATION === "false"
  ),
  notification: {
    // Allow dev to test locally without setting up SNS
    enabled: isTruthy(process.env.NOTIFICATION_ENABLED),
    senderName: getDefaultIfUndefined(
      process.env.NOTIFICATION_SENDER_NAME,
      "NOTARISE"
    ),
    senderLogo: getDefaultIfUndefined(process.env.NOTIFICATION_SENDER_LOGO, ""),
    templateID: getDefaultIfUndefined(
      process.env.NOTIFICATION_TEMPLATE_ID,
      "000"
    ),
    sns: getSnsConfig(),
    topicArn: getDefaultIfUndefined(
      process.env.NOTIFICATION_TOPIC_ARN,
      "arn:aws:sns:ap-southeast-1:000000000000:PLACEHOLDER_SNS_TOPIC"
    )
  },
  authorizedIssuerMap: getDefaultIfUndefined(
    process.env.AUTHORIZED_ISSUERS_MAP,
    "development"
  )
});

export const config = generateConfig();
