import ssm from "@middy/ssm";

export declare type ISSMOptions = {
  fetchData?: { [key: string]: string };
  disablePrefetch?: boolean;
  cacheKey?: string;
  cacheExpiry?: number;
  setToEnv?: boolean;
  setToContext?: boolean;
};

/**
 * IMPORTANT: Remember to populate the SSM Parameter Store (in all environments) before deployment as @middy/ssm will attempt to retrieve all parameters listed here.
 * Missing parameters will cause the endpoint to fail.
 */
const ssmOptions: ISSMOptions = {
  fetchData: {
    SIGNING_EU_QR_PRIVATE_KEY: "/serverless/SIGNING_EU_QR_PRIVATE_KEY",
    SIGNING_EU_QR_PUBLIC_KEY: "/serverless/SIGNING_EU_QR_PUBLIC_KEY",
    GPAY_COVID_CARD_PRIVATE_KEY:
      "/serverless/api-notarise-healthcerts/GPAY_COVID_CARD_PRIVATE_KEY",
    WHITELIST_NRICS: "/serverless/WHITELIST_NRICS",
  },
  cacheExpiry: 15 * 60 * 1000, // set 15 mins cache
  cacheKey: "ssm-cache-secrets",
  setToEnv: true,
};

const ssmInstance = () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    return {
      before: async (): Promise<void> => {
        // skip middleware logic
      },
    };
  }
  return ssm(ssmOptions);
};

export const withSsm = ssmInstance();
