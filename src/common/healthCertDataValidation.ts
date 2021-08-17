// converts camelCase words to space seperated words
// e.g passportNumber to passport number
import { TestData } from "src/types";
import { DataInvalidError } from "./error";
import { config } from "../config";

const { swabTestTypes } = config;

const toEnglishWords = (variableName: string): string => {
  let newString = "";
  for (let i = 0; i < variableName.length; i += 1) {
    const character = variableName.charAt(i);
    if (character === character.toUpperCase()) {
      newString = `${newString} ${character.toLowerCase()}`;
    } else {
      newString += character;
    }
  }
  return newString;
};

// concats all required missing fields of test data to an a string array to be used
// in the error message
export const validateHealthCertData = (testDataList: TestData[]) => {
  const optionalData = ["nric", "lab", "deviceIdentifier"];
  const invalidParams: string[] = [];
  testDataList.forEach((testData) => {
    // art cert need to have device identifier
    if (
      testData.swabTypeCode === swabTestTypes.ART &&
      !testData.deviceIdentifier
    ) {
      invalidParams.push(toEnglishWords("deviceIdentifier"));
    }
    Object.entries(testData).forEach((entry) => {
      const [key, value] = entry;
      if (!value && !optionalData.includes(key)) {
        invalidParams.push(toEnglishWords(key));
      }
    });
  });

  // dedupe the invalid params
  invalidParams.filter(
    (value, index) => invalidParams.indexOf(value) === index
  );

  // for some reason the entire healthcert is malformed and no test data is pushed at all
  if (testDataList.length === 0) {
    throw new DataInvalidError([
      "observation",
      "specimen",
      "patient",
      "organisation",
    ]);
  }
  if (invalidParams.length > 0) {
    throw new DataInvalidError(invalidParams);
  }
};
