/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { calculateChecksumLetter, validate } from "./nricValidation";

describe("calculateChecksumLetter", () => {
  test("should calculate correctly", () => {
    const S = [
      { nricFirstChar: "S", nricDigits: "0000001" },
      { nricFirstChar: "S", nricDigits: "0000005" },
      { nricFirstChar: "S", nricDigits: "8000006" },
    ].map(calculateChecksumLetter);
    expect(S).toStrictEqual(["I", "A", "E"]);

    const T = [
      { nricFirstChar: "T", nricDigits: "0000001" },
      { nricFirstChar: "T", nricDigits: "0000005" },
      { nricFirstChar: "T", nricDigits: "8000006" },
    ].map(calculateChecksumLetter);
    expect(T).toStrictEqual(["E", "H", "A"]);

    const F = [
      { nricFirstChar: "F", nricDigits: "0000001" },
      { nricFirstChar: "F", nricDigits: "0000005" },
      { nricFirstChar: "F", nricDigits: "8000006" },
    ].map(calculateChecksumLetter);
    expect(F).toStrictEqual(["U", "K", "P"]);

    const G = [
      { nricFirstChar: "G", nricDigits: "0000001" },
      { nricFirstChar: "G", nricDigits: "0000005" },
      { nricFirstChar: "G", nricDigits: "8000006" },
    ].map(calculateChecksumLetter);
    expect(G).toStrictEqual(["P", "T", "K"]);
  });
});
describe("validate", () => {
  test("should fail validation for non strings", () => {
    // @ts-ignore
    expect(validate(0)).toStrictEqual(false);
    // @ts-ignore
    expect(validate([])).toStrictEqual(false);
    // @ts-ignore
    expect(validate({ foo: "bar" })).toStrictEqual(false);
  });
  test("should fail validation for non nric strings", () => {
    expect(validate("foo")).toStrictEqual(false);
    expect(validate("")).toStrictEqual(false);
    expect(validate("🐱")).toStrictEqual(false);
    expect(validate("S00000001I")).toStrictEqual(false);
    expect(validate("S000 0001I")).toStrictEqual(false);
    expect(validate("<script></script>")).toStrictEqual(false);
    expect(validate("S%200000I")).toStrictEqual(false);
  });

  test("should fail validation for wrong checksum", () => {
    expect(validate("S0000001E")).toStrictEqual(false);
    expect(validate("T0000001H")).toStrictEqual(false);
    expect(validate("F0000001H")).toStrictEqual(false);
    expect(validate("G0000001H")).toStrictEqual(false);
  });

  test("should pass validation for valid nrics", () => {
    expect(validate("S0000001I")).toStrictEqual(true);
    expect(validate("T0000001E")).toStrictEqual(true);
    expect(validate("F0000001U")).toStrictEqual(true);
    expect(validate("G0000001P")).toStrictEqual(true);
  });
});
