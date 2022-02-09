import { notarise } from "@govtechsg/oa-schemata";
import moment from "moment-timezone";
import _ from "lodash";
import { config } from "../../../config";
import {
  EuHealthCert,
  EuNameParams,
  EuTestParams,
  TestData,
} from "../../../types";
import * as EUDccTestResult from "../../../static/EU-DCC-test-result.mapping.json";

const { euSigner, swabTestTypes } = config;

export const createEuTestCert = (
  testData: TestData[],
  reference: string,
  storedUrl: string
): EuHealthCert[] => {
  const fhirVersion = "1.3.0";
  const dateString = new Date().toISOString();

  const testHealthCerts: EuHealthCert[] = [];
  let incrementTestNumber = 1;
  testData.forEach((item) => {
    const euName: EuNameParams = {
      fnt: item.patientName.replace(/ /g, "<").toUpperCase(),
    };
    const dob = item.birthDate?.split("/")?.reverse()?.join("-");
    const meta: notarise.NotarisationMetadata = {
      reference,
      notarisedOn: dateString,
      passportNumber: item.passportNumber,
      url: storedUrl,
    };
    // Set increment dose number + reference
    const uniqueRef = `${incrementTestNumber}${reference.toUpperCase()}`;
    // Set Unique Cert Id with prefix + version + country + unique ref
    const UniqueCertificateId = `URN:UVCI:01:SG:${uniqueRef}`;
    const euDccTestResultCode = Object.values(EUDccTestResult).includes(
      item.testResultCode
    )
      ? item.testResultCode
      : _.get(EUDccTestResult, item.testResultCode, null);

    const testGroup: EuTestParams = {
      tg: "840539006",
      tt: "LP6464-4", // need to confirm with MOH for for Serology, it can either be [Nucleic acid amplification with probe detection] or [Rapid immunoassay]
      sc: moment
        .tz(item.swabCollectionDate, "M/D/YY h:mm:ss A", "Asia/Singapore")
        .format(),
      tr: euDccTestResultCode,
      tc: item.provider,
      co: "SG",
      is: euSigner.name,
      ci: UniqueCertificateId,
    };
    // check swab test type is valid PCR Nasal or PCR Saliva
    if (
      [swabTestTypes.PCR_NASAL, swabTestTypes.PCR_SALIVA].includes(
        item.swabTypeCode
      )
    ) {
      testGroup.tt = "LP6464-4"; // test type code for PCR test [Nucleic acid amplification with probe detection]
      testGroup.nm = item.testType;
    } else if (item.swabTypeCode === swabTestTypes.ART) {
      testGroup.tt = "LP217198-3"; // test type code for ART test [Rapid immunoassay]
      testGroup.ma = item.deviceIdentifier;
    }
    // generate test cert only for PCR Nasal, PCR Saliva and ART which have valid test result code
    if (
      euDccTestResultCode &&
      Object.values(swabTestTypes).includes(item.swabTypeCode)
    ) {
      testHealthCerts.push({
        ver: fhirVersion,
        nam: euName,
        dob,
        t: [testGroup],
        meta,
      });
      incrementTestNumber += 1;
    }
  });

  return testHealthCerts;
};
