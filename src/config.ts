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
  authorizedIssuerMap: getDefaultIfUndefined(
    process.env.AUTHORIZED_ISSUERS_MAP,
    "development"
  ),
  notification: {
    enabled: isTruthy(process.env.NOTIFICATION_ENABLED)
  }
});

export const config = generateConfig();
