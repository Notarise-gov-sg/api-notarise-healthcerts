import { AbstractError, ErrorCodes } from "./error";
import { WorkflowContextData, WorkflowReferenceData } from "../types";
import { getLogger } from "./logger";

const { error } = getLogger("src/common/errorHandler");

function assertUnreachable(
  x: "error: Did you forget to handle this error code?"
): never {
  x;
  throw new Error("Didn't expect to get here");
}

export const codedErrorHandler = async (
  errorObject: Error,
  context: WorkflowReferenceData
): Promise<void> => {
  if (
    AbstractError.isCodedError(errorObject) &&
    WorkflowContextData.guard(context)
  ) {
    switch (errorObject.code) {
      case ErrorCodes.DOCUMENT_INVALID:
      case ErrorCodes.TEST_RESULTS_EXPIRED:
      case ErrorCodes.UNRECOGNISED_CLINIC:
      case ErrorCodes.MISMATCHING_PARTICULARS:
        error(
          `Notifiable error encountered, sending notification to user ${JSON.stringify(
            context.user
          )}`
        );
        return;
      default:
        // if an error got here you should have added this class of errors to the switch case above
        error(`Unhandled coded error, reference: ${context.reference}`);
        assertUnreachable(errorObject.code);
    }
  }
  // all handled errors should have returned by now
  error(
    `Unexpected application error encountered in codedErrorHandler, reference: ${context.reference}`
  );
  if (process.env.IS_OFFLINE === "true") {
    error(errorObject);
  } else {
    throw errorObject;
  }
};
