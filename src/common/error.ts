import { getLogger } from "../common/logger";

const codedErrorSymbol = Symbol("Error code property");

const { error: errorLogger } = getLogger("src/common/error");

export abstract class AbstractError extends Error {
  // we use a Symbol() here to make sure this object key will never
  // be collided with - since error codes aren't all that uncommon
  [codedErrorSymbol]: ErrorCodes;

  codeString: string;

  static isCodedError(error: any): error is AbstractError {
    return error[codedErrorSymbol] !== undefined;
  }

  // this only exists to get typescript check to pass, it
  // doesn't actually get called :D
  // don't hate me hate the language
  get code(): ErrorCodes {
    return this[codedErrorSymbol];
  }

  constructor(message: string, code: ErrorCodes, codeString: string) {
    super(message);
    this[codedErrorSymbol] = code;
    this.codeString = codeString;
    // we do Object.defineProperty instead of getter or function is because
    // thrown objects do not retain non-enumerable properties -
    // e.g the functions on these classes disappear after being thrown
    // as an error
    // https://coderwall.com/p/be8mba/error-properties-are-not-enumerable-in-javascript
    Object.defineProperty(this, "code", {
      value: this[codedErrorSymbol],
      enumerable: true, // this must be here
      writable: false
    });
  }
}

export class DetailedCodedError extends AbstractError {
  title: string;

  messageBody: string;

  constructor(
    message: string,
    code: number,
    codeString: string,
    title: string,
    messageBody: string
  ) {
    super(message, code, codeString);
    this.messageBody = messageBody;
    this.title = title;
  }
}

export enum ErrorCodes {
  // 4xxx invalid requests error
  MISMATCHING_PARTICULARS = 4001,
  UNRECOGNISED_CLINIC = 4002,
  TEST_RESULTS_EXPIRED = 4003,
  DOCUMENT_INVALID = 4004

  // 5xxx internal server error
}

export class UnrecognisedClinicError extends DetailedCodedError {
  constructor() {
    super(
      "Unrecognised clinic error",
      ErrorCodes.UNRECOGNISED_CLINIC,
      ErrorCodes[ErrorCodes.UNRECOGNISED_CLINIC],
      "Submitted HealthCert not from recognised clinic",
      "The HealthCert was not issued by a clinic recognised by the Ministry of Health Singapore"
    );
  }
}

export class TestResultsExpiredError extends DetailedCodedError {
  constructor() {
    super(
      "Expired test results error",
      ErrorCodes.TEST_RESULTS_EXPIRED,
      ErrorCodes[ErrorCodes.TEST_RESULTS_EXPIRED],
      "Submitted HealthCert has expired test results",
      "The test result is no longer valid. \n The HealthCert needs to be submitted within 72 hours of the test."
    );
  }
}

export class DocumentInvalidError extends DetailedCodedError {
  constructor(errorMessage: string) {
    errorLogger(`DocumentInvalidError triggered with reason: ${errorMessage}`);
    super(
      "Invalid document error",
      ErrorCodes.DOCUMENT_INVALID,
      ErrorCodes[ErrorCodes.DOCUMENT_INVALID],
      "Submitted HealthCert is invalid",
      "The submitted HealthCert has discrepancies in it, \n please contact the HealthCert issuer for clarification."
    );
  }
}
