import SSM from "aws-sdk/clients/ssm";
import { getLogger } from "./common/logger";

const ssm = new SSM();
const { trace, error } = getLogger("src/config.ts");

const isTruthy = (val?: string) => val === "true" || val === "True";

// this function exists because serverless gives a string of "undefined" for unpopulated values
// https://github.com/serverless/serverless/issues/3491
const getDefaultIfUndefined = (
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
  name: getDefaultIfUndefined(
    process.env.SIGNING_EU_QR_NAME,
    sampleSigningDidName
  ),
  publicKey: getDefaultIfUndefined(
    process.env.SIGNING_EU_QR_PUBLIC_KEY?.replace(/\\n/g, "\n"),
    ""
  ),
  privateKey: getDefaultIfUndefined(
    process.env.SIGNING_EU_QR_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ""
  ),
});

const getGPayCovidCardSigner = async () => {
  let privKeyValue: string;

  try {
    privKeyValue = process.env.GPAY_COVID_CARD_PRIVATE_KEY
      ? process.env.GPAY_COVID_CARD_PRIVATE_KEY.replace(/\\n/g, "\n")
      : await new Promise((resolve, reject) => {
          const ssmName =
            "/serverless/api-notarise-healthcerts/GPAY_COVID_CARD_PRIVATE_KEY";

          trace(`Attempting to retrieve ${ssmName} from SSM...`);
          ssm.getParameter(
            {
              Name: ssmName,
              WithDecryption: true,
            },
            (err, data) => {
              if (err) {
                error(
                  `Unable to obtain ${ssmName} from SSM. If you are developing locally, remember to set ${ssmName} in the local .env file.`
                );
                reject(err);
              } else {
                resolve(data.Parameter?.Value ?? "");
              }
            }
          );
        });
  } catch (e) {
    error(e);
    privKeyValue = "";
  }

  return {
    issuer: getDefaultIfUndefined(
      process.env.GPAY_COVID_CARD_ISSUER,
      "notarise-gpay-stg@gvt0048-gcp-233-notarise-pd.iam.gserviceaccount.com" // Staging Issuer
    ),
    issuerId: getDefaultIfUndefined(
      process.env.GPAY_COVID_CARD_ISSUER_ID,
      "3388000000018787306" // Staging Issuer ID
    ),
    privateKey: privKeyValue,
  };
};

const generateConfig = () => ({
  documentName: "HealthCert",
  isOffline: isTruthy(process.env.IS_OFFLINE),
  transientStorage: getTransientStorageConfig(),
  authorizedIssuers: getAuthorizedIssuersApiConfig(),
  didSigner: getDidSigner(),
  euSigner: getEuSigner(),
  gpaySigner: getGPayCovidCardSigner,
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
  isOfflineQrEnabled: !!process.env.OFFLINE_QR_ENABLED,
  isGPayCovidCardEnabled: !!process.env.GPAY_COVID_CARD_ENABLED,
  swabTestTypes: {
    ART: "697989009",
    PCR: "258500001",
  },
});

export const config = generateConfig();
