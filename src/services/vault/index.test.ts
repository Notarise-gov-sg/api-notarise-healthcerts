import * as dynamoDbService from "../dynamoDB/dynamoDB";
import { getPersonalDataFromVault, checkValidPatientName } from "./index";

const mockData: any = {
  uin: "e44f2ee89027d641659f23f9d6188d16cc576bcfd57d21caa032b50e75758657",
  dateofbirth: "1990-01-15",
  gender: "F",
  principalname: "Tan Chen Chen",
};

describe("test vaultService", () => {
  it("should return vault data for valid uin", async () => {
    const mockFIN = "S3001470G";
    jest.spyOn(dynamoDbService, "getItem").mockResolvedValue(mockData);
    await expect(
      getPersonalDataFromVault(mockFIN, "abc")
    ).resolves.toMatchObject({
      uin: "e44f2ee89027d641659f23f9d6188d16cc576bcfd57d21caa032b50e75758657",
      dateofbirth: "1990-01-15",
      gender: "F",
      principalname: "Tan Chen Chen",
    });
  });

  it("check the patient name if it's contain in principal name", async () => {
    expect(checkValidPatientName("Tan Chen Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Tan Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Chen Chen", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Tan", "Tan Chen Chen")).toBe(true);
    expect(checkValidPatientName("Chen", "Tan Chen Chen")).toBe(true);
  });
});
