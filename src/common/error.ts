import { APIGatewayProxyResult } from "aws-lambda";

/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
export enum ErrorType {
  // 4xx invalid requests error
  INVALID_REQUEST_PAYLOAD = 400,
  INVALID_DOCUMENT = 400,
  INVALID_SCHEMA = 400,
  INVALID_HEALTHCERT_TYPE = 400,
  INVALID_LOGO = 400,
  UNRECOGNISED_CLINIC = 400,

  // 5xx internal server error
  NOTARISE_PDT_ERROR = 500,
  SPM_NOTIFICATION_ERROR = 500,
  GPAY_COVID_CARD_ERROR = 500,
  UNKNOWN_ERROR = 500,
  EU_QR_ERROR = 500,
  VAULT_DATA_ERROR = 500,
}

/* eslint-enable no-unused-vars, no-shadow */

type ErrorStrings = keyof typeof ErrorType;

const tryParse = (s?: string) => {
  if (!s) return s;
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch (e) {
    return s;
  }
};

export class CodedError extends Error {
  type: ErrorStrings;

  details?: string;

  statusCode: number;

  /**
   * Custom coded error for debugging purposes
   * @param type
   * @param message
   * @param details treated as private and omitted from `toResponse()`
   */
  constructor(type: ErrorStrings, message: string, details?: string) {
    super(message);
    this.name = "CodedError";
    this.type = type;
    this.details = details;
    this.statusCode = ErrorType[type];
  }

  toJSON() {
    return {
      error: true,
      statusCode: this.statusCode,

      type: this.type,
      message: tryParse(this.message),
      details: tryParse(this.details),
    };
  }

  toString() {
    return `[${this.name}] ${this.type}: ${JSON.stringify(this.toJSON())}`;
  }

  toResponse(reference: string): APIGatewayProxyResult {
    const { error, statusCode, ...rest } = this.toJSON();
    delete rest.details; // Details are considered private and omitted from API response
    const body = { error, statusCode, reference, ...rest }; // Insert reference as 3rd property

    return {
      statusCode: this.statusCode,
      headers: {
        "x-trace-id": reference,
      },
      body: JSON.stringify(body),
    };
  }
}
