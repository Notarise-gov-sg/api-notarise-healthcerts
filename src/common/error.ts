import { getLogger } from "../common/logger";

const codedErrorSymbol = Symbol("Error code property");

const { error: errorLogger } = getLogger("src/common/error");

/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
export enum ErrorCodes {
  // 4xxx invalid requests error
  MISMATCHING_PARTICULARS = 4001,
  UNRECOGNISED_CLINIC = 4002,
  TEST_RESULTS_EXPIRED = 4003,
  DOCUMENT_INVALID = 4004,
  DATA_INVALID = 4005,
  FILE_TYPE_INVALID = 4006,
  FILE_INVALID = 4007,

  // 5xxx internal server error
}

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
      writable: false,
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

export class UnrecognisedClinicError extends DetailedCodedError {
  constructor(issuerDomain: string, type: string) {
    errorLogger(
      `UnrecognisedClinicError triggered by issuer domain: ${issuerDomain} (${type})`
    );
    super(
      "Unrecognised clinic error",
      ErrorCodes.UNRECOGNISED_CLINIC,
      ErrorCodes[ErrorCodes.UNRECOGNISED_CLINIC],
      `Submitted HealthCert not a recognised/whitelisted clinic - ${issuerDomain} (${type})`,
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
      errorMessage
    );
  }
}

export class DataInvalidError extends DetailedCodedError {
  constructor(invalidParams: string[]) {
    errorLogger(
      `DataInvalidError triggered with reason: ${invalidParams.join(
        ", "
      )} missing`
    );
    super(
      "Invalid data error",
      ErrorCodes.DATA_INVALID,
      ErrorCodes[ErrorCodes.DATA_INVALID],
      "Submitted HealthCert is invalid",
      `Error reading the following parameters: ${invalidParams.join(", ")}.`
    );
  }
}

export class FileTypeInvalidError extends DetailedCodedError {
  constructor(invalidType: string) {
    errorLogger(
      `FileTypeInvalidError triggered with reason: ${invalidType} file received`
    );
    super(
      "Invalid file type",
      ErrorCodes.FILE_TYPE_INVALID,
      ErrorCodes[ErrorCodes.FILE_TYPE_INVALID],
      "Submitted HealthCert is of the wrong file type",
      `The file you have attached is an ${invalidType} file.
Only .oa files can be uploaded at Notarise.

In case you did not already receive this file form the clinic, please contact for the required .oa file.`
    );
  }
}

export class FileInvalidError extends DetailedCodedError {
  constructor(message: string) {
    errorLogger(`FileInvalidError triggered with reason: ${message}`);
    super(
      "Invalid file",
      ErrorCodes.FILE_INVALID,
      ErrorCodes[ErrorCodes.FILE_INVALID],
      "Submitted HealthCert is invalid",
      `We noted that there were formatting errors in the submitted .oa file.

Please request for clinic to re-issue the document correctly before submission at Notarise.`
    );
  }
}
