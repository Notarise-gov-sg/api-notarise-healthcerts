import { signAndPack } from "@pathcheck/dcc-sdk";
import { notarise } from "@govtechsg/oa-schemata";
import { EuHealthCert } from "../../../types";
import { config, getDefaultIfUndefined } from "../../../config";

const { euSigner } = config;

/* 
  Implement this function for set specific expiry datetime. 
  `makeCWT` function in `@pathcheck/dcc-sdk` package only support to set expiry month.   
*/
const makeCWT = (payload: EuHealthCert, expiryDateTime: Date) => {
  const CWT_ISSUER = 1;
  const CWT_EXPIRATION = 4;
  const CWT_ISSUED_AT = 6;
  const CWT_HCERT = -260;
  const CWT_HCERT_V1 = 1;

  const cwt = new Map();
  const iss = new Date();
  cwt.set(CWT_ISSUED_AT, Math.round(iss.getTime() / 1000));
  cwt.set(CWT_EXPIRATION, Math.round(expiryDateTime.getTime() / 1000));
  cwt.set(CWT_ISSUER, euSigner.name);
  cwt.set(CWT_HCERT, new Map());
  cwt.get(CWT_HCERT).set(CWT_HCERT_V1, payload);
  return cwt;
};

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
  const expiryDateTime = new Date();
  expiryDateTime.setDate(expiryDateTime.getDate() + 7);
  await Promise.all(
    euHealthCerts.map(async (euHealthCert) => {
      const qrData = await signAndPack(
        makeCWT(euHealthCert, expiryDateTime),
        publicKey,
        privateKey
      );
      const testType =
        euHealthCert.t[0].tt === "LP6464-4"
          ? "PCR"
          : euHealthCert.t[0].tt === "LP217198-3"
          ? "ART"
          : "";
      testHealthCertsQr.push({
        type: testType,
        qr: qrData,
        expiryDateTime: expiryDateTime.toISOString(),
      });
    })
  );
  return testHealthCertsQr;
};
