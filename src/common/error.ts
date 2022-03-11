import { APIGatewayProxyResult } from "aws-lambda";

/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
export enum ErrorType {
  // 4xxx invalid requests error
  MISMATCHING_PARTICULARS = 4001,
  UNRECOGNISED_CLINIC = 4002,
  TEST_RESULTS_EXPIRED = 4003,
  DOCUMENT_INVALID = 4004,
  DATA_INVALID = 4005,
  FILE_TYPE_INVALID = 4006,
  FILE_INVALID = 4007,

  // 5xxx internal server error
  UNKNOWN_ERROR = 5000,
  EU_QR_ERROR = 5001,
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
