import { validateInputs } from "./validateInputs";
import { validateDocument } from "./validateDocument";

jest.mock("./validateDocument");

const mockValidateDocument = validateDocument as jest.Mock;

const sampleDocument: any = {};

it("should pass when validation passes", async () => {
  mockValidateDocument.mockResolvedValue(undefined);
  await expect(validateInputs(sampleDocument)).resolves.not.toThrow();
});

it("should throw when validateDocument throws", async () => {
  mockValidateDocument.mockRejectedValue(new Error("Some error message"));
  await expect(validateInputs(sampleDocument)).rejects.toThrow(
    /Some error message/
  );
});
