import { TestData } from "src/models/healthCert";
import { createEuTestCert } from "./index";

describe("createEuTestCert for PCR Nasopharyngeal Swab", () => {
  let dateNowSpy: jest.SpyInstance;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    dateNowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2021-06-30T00:00:00.000Z");
  });
  afterAll(() => {
    spy.mockRestore();
    dateNowSpy.mockRestore();
  });

  const testData: TestData[] = [
    {
      provider: "MacRitchie Medical Clinic",
      gender: "M",
      lab: "lab",
      nationality: "SG",
      nric: "123",
      observationDate: "6/28/21 2:15:00 PM GMT+08:00",
      passportNumber: "ES12345",
      patientName: "TESTING",
      performerMcr: "123",
      performerName: "123",
      birthDate: "01/01/2021",
      swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
      swabType: "Nasopharyngeal swab",
      swabTypeCode: "258500001",
      testType:
        "Reverse transcription polymerase chain reaction (rRT-PCR) test",
      testResult: "Positive",
      testResultCode: "260373001",
    },
  ];

  it("create EU test cert with valid params", async () => {
    const result = await createEuTestCert(testData, "abc-cde-cde", "storedUrl");
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TESTING",
          gnt: "TESTING",
        },
        dob: "2021-01-01",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: testData[0].testType,
            sc: "2021-06-27T14:15:00+08:00",
            tr: "260373001",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "REF:V1:SG:ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "ES12345",
          url: "storedUrl",
        },
      },
    ]);
  });
});

describe("createEuTestCert for ART Anterior Nares Swab", () => {
  let dateNowSpy: jest.SpyInstance;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    dateNowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2021-06-30T00:00:00.000Z");
  });
  afterAll(() => {
    spy.mockRestore();
    dateNowSpy.mockRestore();
  });

  const testData: TestData[] = [
    {
      provider: "MacRitchie Medical Clinic",
      gender: "M",
      lab: "lab",
      nationality: "SG",
      nric: "123",
      observationDate: "6/28/21 2:15:00 PM GMT+08:00",
      passportNumber: "ES12345",
      patientName: "TESTING",
      performerMcr: "123",
      performerName: "123",
      birthDate: "01/01/2021",
      swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
      swabType: "Anterior nares swab",
      swabTypeCode: "697989009",
      testType: "Quidel QuickVue At-Home OTC COVID-19 Test",
      testResult: "Positive",
      testResultCode: "260373001",
      deviceIdentifier: "1232",
    },
  ];

  it("create EU test cert with valid params", async () => {
    const result = await createEuTestCert(testData, "abc-cde-cde", "storedUrl");
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TESTING",
          gnt: "TESTING",
        },
        dob: "2021-01-01",
        t: [
          {
            tg: "840539006",
            tt: "LP217198-3",
            ma: testData[0].deviceIdentifier,
            sc: "2021-06-27T14:15:00+08:00",
            tr: "260373001",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "REF:V1:SG:ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "ES12345",
          url: "storedUrl",
        },
      },
    ]);
  });
});

describe("createEuTestCert for Multiple Swab Test Result", () => {
  let dateNowSpy: jest.SpyInstance;
  let spy: jest.SpyInstance;
  beforeAll(() => {
    spy = jest.spyOn(console, "error").mockImplementation(() => {
      // do not display errors
    });
    dateNowSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2021-06-30T00:00:00.000Z");
  });
  afterAll(() => {
    spy.mockRestore();
    dateNowSpy.mockRestore();
  });

  const testData: TestData[] = [
    {
      provider: "MacRitchie Medical Clinic",
      gender: "M",
      lab: "lab",
      nationality: "SG",
      nric: "123",
      observationDate: "6/28/21 2:15:00 PM GMT+08:00",
      passportNumber: "ES12345",
      patientName: "TESTING",
      performerMcr: "123",
      performerName: "123",
      birthDate: "01/01/2021",
      swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
      swabType: "Nasopharyngeal swab",
      swabTypeCode: "258500001",
      testType:
        "Reverse transcription polymerase chain reaction (rRT-PCR) test",
      testResult: "Positive",
      testResultCode: "260373001",
    },
    {
      provider: "MacRitchie Medical Clinic",
      gender: "M",
      lab: "lab",
      nationality: "SG",
      nric: "123",
      observationDate: "6/28/21 2:15:00 PM GMT+08:00",
      passportNumber: "ES12345",
      patientName: "TESTING",
      performerMcr: "123",
      performerName: "123",
      birthDate: "01/01/2021",
      swabCollectionDate: "6/27/21 2:15:00 PM GMT+08:00",
      swabType: "Anterior nares swab",
      swabTypeCode: "697989009",
      testType: "Quidel QuickVue At-Home OTC COVID-19 Test",
      testResult: "Positive",
      testResultCode: "260373001",
      deviceIdentifier: "1232",
    },
  ];

  it("create EU test cert with valid params", async () => {
    const result = await createEuTestCert(testData, "abc-cde-cde", "storedUrl");
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TESTING",
          gnt: "TESTING",
        },
        dob: "2021-01-01",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: testData[0].testType,
            sc: "2021-06-27T14:15:00+08:00",
            tr: "260373001",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "REF:V1:SG:ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "ES12345",
          url: "storedUrl",
        },
      },
      {
        ver: "1.3.0",
        nam: {
          fnt: "TESTING",
          gnt: "TESTING",
        },
        dob: "2021-01-01",
        t: [
          {
            tg: "840539006",
            tt: "LP217198-3",
            ma: testData[1].deviceIdentifier,
            sc: "2021-06-27T14:15:00+08:00",
            tr: "260373001",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "REF:V1:SG:ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "ES12345",
          url: "storedUrl",
        },
      },
    ]);
  });
});
