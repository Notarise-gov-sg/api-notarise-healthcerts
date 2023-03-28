import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
// import { cloudWatchMiddleware } from "../middleware/cloudWatch";
import { validateSchemaMiddleware } from "../middleware/validateSchema";
import { ssmToEnv, withSsm } from "../middleware/withSsm";

export const middyfy = (handler: Handler) =>
  middy(handler).use([
    withSsm,
    ssmToEnv(),
    jsonBodyParser(),
    validateSchemaMiddleware(),
    // cloudWatchMiddleware(),
    httpErrorHandler(),
  ]);

export const revokeMiddyfy = (handler: Handler) =>
  middy(handler).use([withSsm, jsonBodyParser(), httpErrorHandler()]);

export interface ValidatedAPIGatewayProxyEvent<T = string>
  extends Omit<APIGatewayProxyEvent, "body"> {
  body: T;
}
