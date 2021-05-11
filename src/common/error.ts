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
  UNRECOGNISED_CLINIC = 4002,
  DOCUMENT_INVALID = 4004,
  DATA_INVALID = 4005
  // 5xxx internal server error
}

export class UnrecognisedClinicError extends DetailedCodedError {
  constructor(issuerDomain: string) {
    errorLogger(
      `UnrecognisedClinicError triggered by issuer domain: ${issuerDomain}`
    );
    super(
      "Unrecognised clinic error",
      ErrorCodes.UNRECOGNISED_CLINIC,
      ErrorCodes[ErrorCodes.UNRECOGNISED_CLINIC],
      `HealthCert from unrecognised clinic - ${issuerDomain}`,
      "The HealthCert submitted was not issued from a domain for a medical facility recognised by the Ministry of Health, Singapore"
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
      "Invalid Document",
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
      "Invalid HealthCert",
      `There was an error reading the following parameters, that may need to be rectified: ${invalidParams.join(
        ", "
      )}.`
    );
  }
}
