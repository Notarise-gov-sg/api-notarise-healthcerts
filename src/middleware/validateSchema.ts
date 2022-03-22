import { validateSchema } from "@govtechsg/open-attestation";
import middy, { MiddlewareObj } from "@middy/core";
import { getLogger } from "../common/logger";
import { CodedError } from "../common/error";

const { error: logError } = getLogger("validateSchema-middleware");
type Request = middy.Request;

// Custom middleware must return an obhect of { before?: fn, after?: fn, onError?: fn }
// Every onError middleware can decide to handle the error and create a proper response or to delegate the error to the next middleware.
// by returning the request
// let another middlware, http-error-handler middlware, handle it by throwing an error and returning void
// https://github.com/middyjs/middy#handling-errors

class ValidateSchemaMiddleware implements Pick<MiddlewareObj, "before"> {
  // eslint-disable-next-line class-methods-use-this
  async before(req: Request): Promise<void> {
    const { body } = req.event;
    if (!body || !validateSchema(body)) {
      logError("Body is not a wrapped health cert");
      throw new CodedError(
        "INVALID_SCHEMA",
        "Body must be a wrapped health cert",
        "(!body || !validateSchema(body))"
      );
    }
  }
}

export const validateSchemaMiddleware = (): Pick<MiddlewareObj, "before"> =>
  new ValidateSchemaMiddleware();
