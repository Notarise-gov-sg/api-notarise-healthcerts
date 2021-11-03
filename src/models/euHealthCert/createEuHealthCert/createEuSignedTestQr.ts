import { signAndPack, makeCWT } from "@pathcheck/dcc-sdk";
import { notarise } from "@govtechsg/oa-schemata";
import { EuHealthCert } from "../../../types";
import { config, getDefaultIfUndefined } from "../../../config";

const { euSigner } = config;

export const createEuSignedTestQr = async (euHealthCerts: EuHealthCert[]) => {
  const publicKey = getDefaultIfUndefined(
    process.env.SIGNING_EU_QR_PUBLIC_KEY,
    ""
  ).replace(/\\n/g, "\n");
  const privateKey = getDefaultIfUndefined(
    process.env.SIGNING_EU_QR_PRIVATE_KEY,
    ""
  ).replace(/\\n/g, "\n");
  const testHealthCertsQr: notarise.SignedEuHealthCert[] = [];
  await Promise.all(
    euHealthCerts.map(async (euHealthCert) => {
      const qrData = await signAndPack(
        await makeCWT(euHealthCert, null, euSigner.name),
        publicKey,
        privateKey
      );
      const testType =
        euHealthCert.t[0].tt === "LP6464-4"
          ? "PCR"
          : euHealthCert.t[0].tt === "LP217198-3"
          ? "ART"
          : "";
      testHealthCertsQr.push({ type: testType, qr: qrData });
    })
  );
  return testHealthCertsQr;
};
