// Thanks to https://gist.github.com/kyrene-chew/6f275325335ab27895beb7a9a7b4c1cb

import { padStart, random, zipWith, sum } from "lodash";

export const nricRegex = /([SsTtFfGg])(\d{7})(\D)/;

export function calculateChecksumLetter({
  nricFirstChar,
  nricDigits,
}: {
  nricFirstChar: string;
  nricDigits: string;
}) {
  const weights = [2, 7, 6, 5, 4, 3, 2];
  const digitsArray = nricDigits.split("").map(Number);
  // sum of nric * weights
  let total = sum(zipWith(digitsArray, weights, (a, b) => a * b));
  // if the nric type is T or G, add 4 to the total
  if (["T", "G"].indexOf(nricFirstChar) >= 0) {
    total += 4;
  }
  const letterIndex = total % 11;

  const nricLetterST = ["J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
  const nricLetterFG = ["X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K"];

  if (["S", "T"].indexOf(nricFirstChar) >= 0) {
    return nricLetterST[letterIndex];
  }
  return nricLetterFG[letterIndex];
}

export const validate = (nricInput: string): boolean => {
  if (typeof nricInput !== "string") {
    return false;
  }
  const nric = nricInput.toUpperCase();

  const [wholeNric, nricFirstChar, nricDigits, nricLastChar] =
    nricRegex.exec(nric) || [];
  if (!wholeNric) {
    // means regex did not fully match
    return false;
  }

  const checksumCharacter = calculateChecksumLetter({
    nricFirstChar,
    nricDigits,
  });
  return checksumCharacter === nricLastChar;
};

export const validateAndCleanNric = (inputNric: string): string => {
  const isNricValid = validate(inputNric);
  if (!isNricValid) throw new Error("Invalid NRIC number");
  const cleanedNric = inputNric.match(nricRegex)?.[0].toUpperCase();
  if (!cleanedNric) throw new Error("Invalid NRIC number");
  return cleanedNric;
};

export function generateRandomNric() {
  const digits = padStart(String(random(0, 9999999)));
  const checksumLetter = calculateChecksumLetter({
    nricFirstChar: "S",
    nricDigits: digits,
  });
  return `S${digits}${checksumLetter}`;
}
