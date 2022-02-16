import { validateV2Inputs } from "./validateInputs";
import { validateV2Document } from "./validateDocument";

jest.mock("./validateDocument");

const mockValidateDocument = validateV2Document as jest.Mock;

const sampleDocument: any = {};

it("should pass when validation passes", async () => {
  mockValidateDocument.mockResolvedValue(undefined);
  await expect(validateV2Inputs(sampleDocument)).resolves.not.toThrow();
});

it("should throw when validateDocument throws", async () => {
  mockValidateDocument.mockRejectedValue(new Error("Some error message"));
  await expect(validateV2Inputs(sampleDocument)).rejects.toThrow(
    /Some error message/
  );
});
