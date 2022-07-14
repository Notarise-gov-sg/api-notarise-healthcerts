import axios from "axios";
import { getDemographics, checkValidPatientName } from "./index";

const mockData: any = {
  data: {
    vaultData: [
      {
        uin: "e44f2ee89027d641659f23f9d6188d16cc576bcfd57d21caa032b50e75758657",
        dateofbirth: "1990-01-15",
        gender: "F",
        principalname: "Tan Chen Chen",
      },
    ],
    manualData: [
      {
        uin: "e44f2ee89027d641659f23f9d6188d16cc576bcfd57d21caa032b50e75758657",
        dateofbirth: "1990-01-15",
        gender: "M",
        principalname: "Tan Chen Chen",
      },
    ],
  },
};

const expectedData: any = {
  vaultData: [
    {
      uin: "e44f2ee89027d641659f23f9d6188d16cc576bcfd57d21caa032b50e75758657",
      dateofbirth: "1990-01-15",
      gender: "F",
      principalname: "Tan Chen Chen",
    },
  ],
  manualData: [
    {
      uin: "e44f2ee89027d641659f23f9d6188d16cc576bcfd57d21caa032b50e75758657",
      dateofbirth: "1990-01-15",
      gender: "M",
      principalname: "Tan Chen Chen",
    },
  ],
};

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("test vaultService", () => {
  it("should return vault data for valid uin", async () => {
    const mockFIN = "S3001470G";
    mockedAxios.get.mockResolvedValue(mockData);
    await expect(getDemographics(mockFIN, "abc")).resolves.toMatchObject(
      expectedData
    );
  });

  it("check the patient name if it's contain in principal name", async () => {
    expect(checkValidPatientName("Tan Chen Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Tan Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Chen Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Tan", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Tan Chen Chen Harry", "Tan Chen Chen")).toBe(
      true
    );
    expect(checkValidPatientName("Tan Chen Harry", "Tan Chen Chen")).toBe(
      false
    );
    expect(checkValidPatientName("Tan Chen Harry", "TAN CHEN HARRY")).toBe(
      true
    );
  });
});
