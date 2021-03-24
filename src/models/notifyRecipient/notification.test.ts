/* eslint-disable @typescript-eslint/camelcase */
import { getSpmTemplateInput } from "./notification";
import { TestData } from "../healthCert";

const mockTestData: TestData = {
  provider: "{}",
  lab: "{}",
  swabType: "a",
  patientName: "Person",
  swabCollectionDate: "testdatetime1",
  performerName: "",
  performerMcr: "",
  observationDate: "",
  nric: "a",
  nationality: "",
  gender: "",
  passportNumber: "",
  birthDate: "{}",
  testType: "test1",
  testResult: "Negative"
};

describe("notifyRecipient", () => {
  it("should create the right template message if there is 1 tests", async () => {
    expect(
      getSpmTemplateInput(
        "somestring",
        "E7831177G",
        [mockTestData],
        "2020-11-16T06:26:19.160Z"
      )
    ).toStrictEqual({
      template_id: "SAFETRAVEL-QR-NTF-02",
      template_input: {
        date: "2020-11-16T06:26:19.160Z",
        name: "Person",
        passport: "E7831177G",
        qrcode: "somestring",
        testdatetime: "testdatetime1",
        testresult: "Negative",
        testtype: "test1",
        title: "COVID-19 HEALTHCERT"
      }
    });
  });

  it("should create the right notification message if there are 2 tests", async () => {
    expect(
      getSpmTemplateInput(
        "somestring",
        "E7831177G",
        [
          {
            ...mockTestData,
            testType: "REAL TIME RT-PCR SWAB",
            testResult: "Negative"
          },
          {
            ...mockTestData,
            swabCollectionDate: "testdatetime2",
            testType: "SEROLOGY",
            testResult: "Negative"
          }
        ],
        "2020-11-16T06:26:19.160Z"
      )
    ).toStrictEqual({
      template_id: "SAFETRAVEL-QR-NTF-03",
      template_input: {
        date: "2020-11-16T06:26:19.160Z",
        passport: "E7831177G",
        qrcode: "somestring",
        name: "Person",
        testdatetime: "testdatetime1",
        testresult: "Negative",
        testtype: "COVID-19 PCR TEST RESULT",
        testdatetime2: "testdatetime2",
        testresult2: "Negative",
        testtype2: "COVID-19 SEROLOGY TEST RESULT",
        title: "COVID-19 HEALTHCERT"
      }
    });
  });
});
