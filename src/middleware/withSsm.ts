import ssm from "@middy/ssm";
import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

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
const ssmKeys = {
  SIGNING_EU_QR_PRIVATE_KEY: "/serverless/SIGNING_EU_QR_PRIVATE_KEY",
  SIGNING_EU_QR_PUBLIC_KEY: "/serverless/SIGNING_EU_QR_PUBLIC_KEY",
  GPAY_COVID_CARD_PRIVATE_KEY:
    "/serverless/api-notarise-healthcerts/GPAY_COVID_CARD_PRIVATE_KEY",
  WHITELIST_NRICS: "/serverless/WHITELIST_NRICS",
};

const ssmOptions: ISSMOptions = {
  fetchData: ssmKeys,
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

export const ssmToEnv = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    // have to cast to any because request context does not allow accessing values by [k]
    const ctx: any = request.context;
    Object.keys(ssmKeys).forEach((k) => {
      process.env[k] = ctx[k];
    });
  };

  return {
    before,
  };
};

export const withSsm = ssmInstance();
