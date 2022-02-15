import { notarise } from "@govtechsg/oa-schemata";
import moment from "moment-timezone";
import _ from "lodash";
import { config } from "../../../config";
import { EuHealthCert, EuNameParams, EuTestParams } from "../../../types";
import * as EUDccTestResult from "../../../static/EU-DCC-test-result.mapping.json";
import { ParsedBundle } from "../../fhir/types";

const { euSigner, swabTestTypes } = config;

export const createEuTestCert = (
  parsedFhirBundle: ParsedBundle,
  reference: string,
  storedUrl: string
): EuHealthCert[] => {
  const fhirVersion = "1.3.0";
  const dateString = new Date().toISOString();

  const testHealthCerts: EuHealthCert[] = [];
  let incrementTestNumber = 1;
  parsedFhirBundle.observations.forEach((item) => {
    parsedFhirBundle.patient.fullName;
    const euName: EuNameParams = {
      fnt: parsedFhirBundle.patient.fullName.replace(/ /g, "<").toUpperCase(),
    };
    const dob = parsedFhirBundle.patient.birthDate
      .split("/")
      ?.reverse()
      ?.join("-");
    const meta: notarise.NotarisationMetadata = {
      reference,
      notarisedOn: dateString,
      passportNumber: parsedFhirBundle.patient.passportNumber,
      url: storedUrl,
    };
    // Set increment dose number + reference
    const uniqueRef = `${incrementTestNumber}${reference.toUpperCase()}`;
    // Set Unique Cert Id with prefix + version + country + unique ref
    const UniqueCertificateId = `URN:UVCI:01:SG:${uniqueRef}`;
    const euDccTestResultCode = Object.values(EUDccTestResult).includes(
      item.observation.result.code as string
    )
      ? item.observation.result.code
      : _.get(EUDccTestResult, item.observation.result.code as string, null);

    const testGroup: EuTestParams = {
      tg: "840539006",
      tt: "LP6464-4", // need to confirm with MOH for for Serology, it can either be [Nucleic acid amplification with probe detection] or [Rapid immunoassay]
      sc: moment
        .tz(item.specimen.collectionDateTime, "Asia/Singapore")
        .format(),
      tr: euDccTestResultCode,
      tc: item.organization.lhp.fullName,
      co: "SG",
      is: euSigner.name,
      ci: UniqueCertificateId,
    };
    // check swab test type is valid PCR Nasal or PCR Saliva
    if (
      [swabTestTypes.PCR_NASAL, swabTestTypes.PCR_SALIVA].includes(
        item.specimen.swabType.code as string
      )
    ) {
      testGroup.tt = "LP6464-4"; // test type code for PCR test [Nucleic acid amplification with probe detection]
      testGroup.nm = item.observation.testType.display;
    } else if (item.specimen.swabType.code === swabTestTypes.ART) {
      testGroup.tt = "LP217198-3"; // test type code for ART test [Rapid immunoassay]
      testGroup.ma = item.device?.type.code;
    }
    // generate test cert only for PCR Nasal, PCR Saliva and ART which have valid test result code
    if (
      euDccTestResultCode &&
      Object.values(swabTestTypes).includes(
        item.specimen.swabType.code as string
      )
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
