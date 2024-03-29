import axios from "axios";
import { config } from "../../config";
import { getLogger } from "../../common/logger";

const { trace, error } = getLogger("src/services/vault");

interface personalData {
  uin: string;
  dateofbirth: string;
  gender: string;
  principalname: string;
}

interface demographicsResponse {
  vaultData: personalData[];
  manualData: personalData[];
}

export const getDemographics = async (
  uin: string,
  reference: string
): Promise<demographicsResponse | null> => {
  const traceWithRef = trace.extend(`reference:${reference}`);
  const errorWithRef = error.extend(`reference:${reference}`);
  try {
    const headers = {
      "x-api-key": `${config.apiResident.apiKey}`,
      "Content-Type": "application/json",
    };
    const getDemographicsUrl = `${config.apiResident.endpoint}/demographics/${uin}`;
    const response = await axios.get(getDemographicsUrl, {
      headers,
    });
    traceWithRef(
      `Retrieved demographics for ${uin.slice(0, 5)}: ${JSON.stringify(
        response.data
      )}`
    );
    return response.data;
  } catch (e) {
    errorWithRef(`Error retrieving demographics for ${uin.slice(0, 5)}`);
    errorWithRef(e);
    return null;
  }
};

export const checkValidPatientName = (
  fullName: string,
  vaultFullName: string
): boolean => {
  const parseVaultFullName = vaultFullName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]+/g, "")
    .split(" ");
  const parseFullName = fullName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]+/g, "")
    .split(" ");
  const fullNameMatchedCount = parseFullName.filter(
    (parseName) => parseVaultFullName.indexOf(parseName) !== -1
  ).length;
  return parseFullName.length < parseVaultFullName.length
    ? fullNameMatchedCount < parseVaultFullName.length
    : fullNameMatchedCount >= parseVaultFullName.length;
};
