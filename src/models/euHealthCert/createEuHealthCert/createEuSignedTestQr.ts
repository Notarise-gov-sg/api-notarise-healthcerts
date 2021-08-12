import { signAndPack, makeCWT } from "@pathcheck/dcc-sdk";
import { EuHealthCert, EuHealthCertQr } from "../../../types";
import { config } from "../../../config";

const { euSigner } = config;

export const createEuSignedTestQr = (
  euHealthCerts: EuHealthCert[]
): EuHealthCertQr[] => {
  const testHealthCertQr: EuHealthCertQr[] = [];
  euHealthCerts.forEach(async (euHealthCert) => {
    const qrData = await signAndPack(
      await makeCWT(euHealthCert, euSigner.validityInMonths, euSigner.name),
      euSigner.publicKey,
      euSigner.privateKey
    );
    testHealthCertQr.push({ qrData });
  });
  return testHealthCertQr;
};
