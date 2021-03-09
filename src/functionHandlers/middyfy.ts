import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

export const middyfy = (handler: Handler) => {
  return middy(handler).use([jsonBodyParser(), httpErrorHandler()]);
};

export interface ValidatedAPIGatewayProxyEvent<T = string>
  extends Omit<APIGatewayProxyEvent, "body"> {
  body: T;
}
