import { signAndPack, makeCWT } from "@pathcheck/dcc-sdk";
import { EuHealthCert, EuHealthCertQr } from "../../../types";
import { config } from "../../../config";

const { euSigner } = config;

export const createEuSignedTestQr = async (euHealthCerts: EuHealthCert[]) => {
  const testHealthCertsQr: EuHealthCertQr[] = [];
  await Promise.all(
    euHealthCerts.map(async (euHealthCert) => {
      const qrData = await signAndPack(
        await makeCWT(
          euHealthCert,
          null,
          euSigner.name
        ),
        euSigner.publicKey,
        euSigner.privateKey
      );
      testHealthCertsQr.push({ qrData });
    })
  );
  return testHealthCertsQr[0];
};
