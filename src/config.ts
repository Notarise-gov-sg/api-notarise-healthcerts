const isTruthy = (val?: string) => val === "true" || val === "True";

// this function exists because serverless gives a string of "undefined" for unpopulated values
// https://github.com/serverless/serverless/issues/3491
export const getDefaultIfUndefined = (
  envVar: string | undefined,
  defaultValue: string
) => (!envVar || envVar === "undefined" ? defaultValue : envVar);

const getTransientStorageConfig = () => ({
  endpoint: getDefaultIfUndefined(process.env.TRANSIENT_STORAGE_URL, ""),
  apiKey: getDefaultIfUndefined(process.env.TRANSIENT_STORAGE_API_KEY, ""),
});

const getAuthorizedIssuersApiConfig = () => ({
  endpoint: getDefaultIfUndefined(process.env.AUTHORIZED_ISSUERS_API_URL, ""),
  apiKey: getDefaultIfUndefined(process.env.AUTHORIZED_ISSUERS_API_KEY, ""),
});

const getOcspResponderApiConfig = () => ({
  endpoint: getDefaultIfUndefined(process.env.REVOCATION_OCSP, ""),
  apiKey: getDefaultIfUndefined(process.env.REVOCATION_OCSP_API_KEY, ""),
});

// Sample keys below are not used in any environments other than tests
const sampleSigningDidName = "Ministry of Health (Singapore)";
const sampleSigningDnsDidLocation = "moh.gov.sg";
const sampleSigningDid = "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E";
const sampleSigningDidKey =
  "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E#controller";
const sampleSigningDidPrivateKey =
  "0x14ef2cd2eb2b363434ec202850946ddcf479458a6b54937f8cf4d0eecb0443fb";
const getDidSigner = () => ({
  name: getDefaultIfUndefined(
    process.env.SIGNING_DID_NAME,
    sampleSigningDidName
  ),
  dns: getDefaultIfUndefined(
    process.env.SIGNING_DNS_DID_LOCATION,
    sampleSigningDnsDidLocation
  ),
  id: getDefaultIfUndefined(process.env.SIGNING_DID, sampleSigningDid),
  key: getDefaultIfUndefined(process.env.SIGNING_DID_KEY, sampleSigningDidKey),
  privateKey: getDefaultIfUndefined(
    process.env.SIGNING_DID_PRIVATE_KEY,
    sampleSigningDidPrivateKey
  ),
});

const getEuSigner = () => ({
  issuer: getDefaultIfUndefined(
    process.env.SIGNING_EU_QR_NAME,
    sampleSigningDidName
  ),
  expiryDays: 7, // set PDT expiry day as 7 (issue date + 7 days)
});

const getGPayCovidCardSigner = () => ({
  issuer: getDefaultIfUndefined(
    process.env.GPAY_COVID_CARD_ISSUER,
    "notarise-gpay-stg@gvt0048-gcp-233-notarise-pd.iam.gserviceaccount.com" // Staging Issuer
  ),
  issuerId: getDefaultIfUndefined(
    process.env.GPAY_COVID_CARD_ISSUER_ID,
    "3388000000018787306" // Staging Issuer ID
  ),
});

const getDynamoDbConfig = () => ({
  residentDemographicsTable: process.env.RESIDENT_DEMOGRAPHICS_TABLE as string,
});

const generateConfig = () => ({
  documentName: "HealthCert",
  isOffline: isTruthy(process.env.IS_OFFLINE),
  transientStorage: getTransientStorageConfig(),
  authorizedIssuers: getAuthorizedIssuersApiConfig(),
  revocationOcsp: getOcspResponderApiConfig(),
  didSigner: getDidSigner(),
  euSigner: getEuSigner(),
  gpaySigner: getGPayCovidCardSigner(),
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
    enabled: isTruthy(process.env.NOTIFICATION_ENABLED),
  },
  healthCertNotification: {
    enabled: isTruthy(process.env.HEALTH_CERT_NOTIFICATION_ENABLED),
  },
  isOfflineQrEnabled: isTruthy(process.env.OFFLINE_QR_ENABLED),
  isGPayCovidCardEnabled: isTruthy(process.env.GPAY_COVID_CARD_ENABLED),
  // Type of Test (Loinc)
  testTypes: {
    ART: "97097-0",
    PCR: "94309-2", // MOH recommended code
    OLD_PCR: "94531-1",
    SER: "94661-6",
    LAMP: "96986-5",
  },
  dynamoDB: getDynamoDbConfig(),
});

export const config = generateConfig();
