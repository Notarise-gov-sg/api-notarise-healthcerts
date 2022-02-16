import { R4 } from "@ahryman40k/ts-fhir-types";
import _ from "lodash";
import { createEuTestCert } from "./index";
import fhirHelper from "../../fhir/index";
import exampleSingleTypePcrHealthCertWithNric from "../../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleSingleTypeArtHealthCertWithNric from "../../../../test/fixtures/v2/pdt_art_with_nric_unwrapped.json";
import exampleMultiTypeHealthCertWithNric from "../../../../test/fixtures/v2/pdt_pcr_ser_multi_result_unwrapped.json";

describe("createEuTestCert for invalid tests", () => {
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

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleSingleTypePcrHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("invalid EU test cert for invalid test result code", async () => {
    parsedFhirBundle.observations[0].observation.result.code = "123456";
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([]);
  });
});

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

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleSingleTypePcrHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("create EU test cert with valid params", async () => {
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2020-09-27T06:15:00Z",
            tr: "260415000",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
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

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleSingleTypeArtHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("create EU test cert with valid params", async () => {
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP217198-3",
            ma: parsedFhirBundle.observations[0].device?.type.code,
            sc: "2020-09-27T06:15:00Z",
            tr: "260415000",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
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

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleMultiTypeHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("create EU test cert with valid params", async () => {
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2021-10-19T11:50:12.152Z",
            tr: "260415000",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
          url: "storedUrl",
        },
      },
    ]);
  });
});

describe("createEuTestCert for PCR Nasopharyngeal Swab with positive/negative test result code", () => {
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

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleSingleTypePcrHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("create EU test cert with valid params negative test result code", async () => {
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2020-09-27T06:15:00Z",
            tr: "260415000",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
          url: "storedUrl",
        },
      },
    ]);
  });

  it("create EU test cert with valid params positive test result code", async () => {
    parsedFhirBundle.observations[0].observation.result.display = "Positive";
    parsedFhirBundle.observations[0].observation.result.code = "10828004";
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2020-09-27T06:15:00Z",
            tr: "260373001",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
          url: "storedUrl",
        },
      },
    ]);
  });
});

describe("createEuTestCert for PCR Nasopharyngeal Swab with detected/not_detected test result code", () => {
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

  const parsedFhirBundle = fhirHelper.parse(
    exampleSingleTypePcrHealthCertWithNric.fhirBundle as R4.IBundle
  );

  it("create EU test cert with valid params not_detected test result code", async () => {
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2020-09-27T06:15:00Z",
            tr: "260415000",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
          url: "storedUrl",
        },
      },
    ]);
  });

  it("create EU test cert with valid params detected test result code", async () => {
    parsedFhirBundle.observations[0].observation.result.display = "Detected";
    parsedFhirBundle.observations[0].observation.result.code = "260373001";
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2020-09-27T06:15:00Z",
            tr: "260373001",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
          url: "storedUrl",
        },
      },
    ]);
  });
});

describe("createEuTestCert for PCR Saliva Swab", () => {
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

  const parsedFhirBundle = _.cloneDeep(
    fhirHelper.parse(
      exampleSingleTypePcrHealthCertWithNric.fhirBundle as R4.IBundle
    )
  );

  it("create EU test cert with valid params", async () => {
    parsedFhirBundle.observations[0].specimen.swabType.display = "Sliva swab";
    parsedFhirBundle.observations[0].specimen.swabType.code = "119342007";
    const result = await createEuTestCert(
      parsedFhirBundle,
      "abc-cde-cde",
      "storedUrl"
    );
    expect(result).toMatchObject([
      {
        ver: "1.3.0",
        nam: {
          fnt: "TAN<CHEN<CHEN",
        },
        dob: "1990-01-15",
        t: [
          {
            tg: "840539006",
            tt: "LP6464-4",
            nm: parsedFhirBundle.observations[0].observation.testType.display,
            sc: "2020-09-27T06:15:00Z",
            tr: "260415000",
            tc: "MacRitchie Medical Clinic",
            co: "SG",
            is: "Ministry of Health (Singapore)",
            ci: "URN:UVCI:01:SG:1ABC-CDE-CDE",
          },
        ],
        meta: {
          reference: "abc-cde-cde",
          notarisedOn: "2021-06-30T00:00:00.000Z",
          passportNumber: "E7831177G",
          url: "storedUrl",
        },
      },
    ]);
  });
});
