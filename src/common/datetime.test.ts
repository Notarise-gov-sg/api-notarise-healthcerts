import { parseDateWithoutZeroes } from "./datetime";

describe("test parseDateWithoutZeroes function", () => {
  it("should correctly remove fields with zeroes", () => {
    const testData = ["1994-11-12", "1994-11-00", "1994-00-00"];
    const expected = ["1994-11-12", "1994-11", "1994"];

    testData.forEach((input, index) => {
      const result = parseDateWithoutZeroes(input);
      expect(result).toEqual(expected[index]);
    });
  });
});
