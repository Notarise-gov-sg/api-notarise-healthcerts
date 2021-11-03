import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { cloudWatchMiddleware } from "../middleware/cloudWatch";
import { validateSchemaMiddleware } from "../middleware/validateSchema";
import { withSsm } from "../middleware/withSsm";

export const middyfy = (handler: Handler) =>
  middy(handler).use([
    withSsm,
    jsonBodyParser(),
    validateSchemaMiddleware(),
    cloudWatchMiddleware(),
    httpErrorHandler(),
  ]);

export interface ValidatedAPIGatewayProxyEvent<T = string>
  extends Omit<APIGatewayProxyEvent, "body"> {
  body: T;
}
