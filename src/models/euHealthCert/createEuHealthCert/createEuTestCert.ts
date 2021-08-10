import { notarise } from "@govtechsg/oa-schemata";
import moment from "moment-timezone";
import { TestData } from "src/models/healthCert";
import { config } from "../../../config";
import { EuHealthCert, EuNameParams, EuTestParams } from "../../../types";

const { euSigner, swabTestTypes } = config;

export const createEuTestCert = (
  testData: TestData[],
  reference: string,
  storedUrl: string
): EuHealthCert => {
  const fhirVersion = "1.3.0";
  const EuName: EuNameParams = {
    fnt: testData[0].patientName.replace(/ /g, "<").toUpperCase(),
    gnt: testData[0].patientName.replace(/ /g, "<").toUpperCase(),
  };
  // Set Unique Cert Id with version + country + unique ref
  const UniqueCertificateId = `REF:V1:SG:${reference.toUpperCase()}`;

  const testGroups: EuTestParams[] = [];
  testData.forEach((item) => {
    const testGroup: EuTestParams = {
      tg: "840539006",
      tt: "LP6464-4", // need to confirm with MOH for for Serology, it can either be [Nucleic acid amplification with probe detection] or [Rapid immunoassay]
      sc: moment
        .tz(item.swabCollectionDate, "M/D/YY h:mm:ss A", "Asia/Singapore")
        .format(),
      tr: item.testResultCode,
      tc: item.provider,
      co: "SG",
      is: euSigner.name,
      ci: UniqueCertificateId,
    };
    if (item.swabTypeCode === swabTestTypes.PCR) {
      testGroup.tt = "LP6464-4"; // test type code for PCR test [Nucleic acid amplification with probe detection]
      testGroup.nm = item.testType;
    } else if (item.swabTypeCode === swabTestTypes.ART) {
      testGroup.tt = "LP217198-3"; // test type code for ART test [Rapid immunoassay]
      testGroup.ma = item.deviceIdentifier;
    }
    testGroups.push(testGroup);
  });

  const dateString = new Date().toISOString();
  const meta: notarise.NotarisationMetadata = {
    reference,
    notarisedOn: dateString,
    passportNumber: testData[0].passportNumber,
    url: storedUrl,
  };

  return {
    ver: fhirVersion,
    nam: EuName,
    dob: testData[0].birthDate?.split("/")?.reverse()?.join("-"),
    t: testGroups,
    meta,
  };
};
