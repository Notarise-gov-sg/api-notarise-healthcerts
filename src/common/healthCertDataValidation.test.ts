import { validateHealthCertData } from "./healthCertDataValidation";
import { DataInvalidError } from "./error";

describe("validateHealthCertData", () => {
  test("should not flag optional data as invalid", () => {
    const testData = [
      {
        provider: "name",
        gender: "M",
        lab: "lab",
        nationality: "SG",
        nric: undefined,
        observationDate: "123",
        passportNumber: "123",
        patientName: "123",
        performerMcr: "123",
        performerName: "123",
        birthDate: "123",
        swabCollectionDate: "123",
        swabType: "123",
        testType: "123",
      },
    ];
    // @ts-ignore
    expect(() => validateHealthCertData(testData)).not.toThrow(
      DataInvalidError
    );
  });

  test("should not flag valid ART cert data as invalid", () => {
    const testData = [
      {
        provider: "name",
        gender: "M",
        lab: "lab",
        nationality: "SG",
        nric: undefined,
        observationDate: "123",
        passportNumber: "123",
        patientName: "123",
        performerMcr: "123",
        performerName: "123",
        birthDate: "123",
        swabCollectionDate: "123",
        swabType: "Anterior nares swab",
        swabTypeCode: "697989009",
        testType: "123",
        deviceIdentifier: "1232",
      },
    ];
    // @ts-ignore
    expect(() => validateHealthCertData(testData)).not.toThrow(
      DataInvalidError
    );
  });

  test("should flag device data missing as invalid in ART cert", () => {
    const testData = [
      {
        provider: "name",
        gender: "M",
        lab: "lab",
        nationality: "SG",
        nric: undefined,
        observationDate: "123",
        passportNumber: "123",
        patientName: "123",
        performerMcr: "123",
        performerName: "123",
        birthDate: "123",
        swabCollectionDate: "123",
        swabType: "Anterior nares swab",
        swabTypeCode: "697989009",
        testType: "123",
      },
    ];
    // @ts-ignore
    expect(() => validateHealthCertData(testData)).toThrow(DataInvalidError);
  });

  test("should flag missing required fields as invalid", () => {
    const testData = [
      {
        provider: "",
        gender: "",
        lab: "",
        nationality: "",
        nric: undefined,
        observationDate: "",
        passportNumber: "",
        patientName: "",
        performerMcr: "",
        performerName: "",
        birthDate: "",
        swabCollectionDate: "",
        swabType: "",
        testType: "",
      },
    ];
    // @ts-ignore
    expect(() => validateHealthCertData(testData)).toThrow(DataInvalidError);
  });
});
