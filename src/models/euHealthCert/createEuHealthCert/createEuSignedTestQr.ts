import { signAndPack, makeCWT } from "@pathcheck/dcc-sdk";
import { EuHealthCert } from "../../../types";
import { config } from "../../../config";

const { euSigner } = config;

export const createEuSignedTestQr = async (euHealthCert: EuHealthCert) => {
  const qrData = await signAndPack(
    await makeCWT(euHealthCert, euSigner.validityInMonths, euSigner.name),
    euSigner.publicKey,
    euSigner.privateKey
  );
  return qrData;
};
