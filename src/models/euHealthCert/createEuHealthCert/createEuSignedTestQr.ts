import { signAndPack, makeCWT } from "@pathcheck/dcc-sdk";
import { EuHealthCert, EuHealthCertQr } from "../../../types";
import { config } from "../../../config";

const { euSigner } = config;

export const createEuSignedTestQr = async (euHealthCerts: EuHealthCert[]) => {
  const testHealthCertsQr: EuHealthCertQr[] = [];
  await Promise.all(
    euHealthCerts.map(async (euHealthCert) => {
      const qrData = await signAndPack(
        await makeCWT(euHealthCert, null, euSigner.name),
        euSigner.publicKey,
        euSigner.privateKey
      );
      const testType =
        euHealthCert.t[0].tt === "LP6464-4"
          ? "PCR"
          : euHealthCert.t[0].tt === "LP217198-3"
          ? "ART"
          : "";
      testHealthCertsQr.push({ type: testType, qrData });
    })
  );
  return testHealthCertsQr;
};
