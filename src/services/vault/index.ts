import { config } from "../../config";
import { getItem } from "../dynamoDB";
import { hashIC } from "../../common/hash";
import { getLogger } from "../../common/logger";

const { trace } = getLogger("src/services/vault");

interface personalData {
  uin: string;
  dateofbirth: string;
  gender: string;
  principalname: string;
}

export const getPersonalDataFromVault = async (
  uin: string,
  reference: string
): Promise<personalData | null> => {
  const traceWithRef = trace.extend(`reference:${reference}`);
  const param: any = {
    TableName: config.dynamoDB.residentDemographicsTable,
    Key: {
      uin: hashIC(uin),
    },
  };
  traceWithRef(`Uin Hash : ${param.Key.uin}`);
  const item = await getItem(param);
  const isUinInVault = !!item;
  traceWithRef(`Is uin in vault : ${isUinInVault}`);
  return isUinInVault
    ? {
        uin: item?.uin as string,
        dateofbirth: item?.dateofbirth as string,
        gender: item?.gender as string,
        principalname: item?.principalname as string,
      }
    : null;
};

export const checkValidPatientName = (
  fullName: string,
  principalName: string
): boolean => {
  const parsePrincipalName = principalName
    .replace(/[^a-zA-Z0-9 ]+/g, "")
    .split(" ");
  const parseFullName = fullName.replace(/[^a-zA-Z0-9 ]+/g, "").split(" ");
  return (
    parsePrincipalName.filter(
      (parseName) => parseFullName.indexOf(parseName) !== -1
    ).length >= parseFullName.length
  );
};
