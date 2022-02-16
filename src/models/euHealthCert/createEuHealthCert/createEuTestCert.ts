import { notarise, pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import _ from "lodash";
import { getLogger } from "../../../common/logger";
import { config } from "../../../config";
import { EuHealthCert, EuNameParams, EuTestParams } from "../../../types";
import * as EUDccTestResult from "../../../static/EU-DCC-test-result.mapping.json";
import { ParsedBundle } from "../../fhir/types";
import { Type } from "../../fhir/constraints";
import { createEuSignedTestQr } from "./createEuSignedTestQr";

const { trace } = getLogger("src/models/euHealthCert/createEuTestCert");
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
      sc: item.specimen.collectionDateTime,
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

export const generateEuHealthCert = async (
  type: Type,
  parsedFhirBundle: ParsedBundle,
  reference: string,
  storedUrl: string
): Promise<notarise.SignedEuHealthCert[]> => {
  const traceWithRef = trace.extend(`reference:${reference}`);
  const { PdtTypes } = pdtHealthCertV2;
  let signedEuHealthCerts: notarise.SignedEuHealthCert[] = [];
  if (
    (_.isString(type) && (type === PdtTypes.Art || type === PdtTypes.Pcr)) ||
    type.includes(PdtTypes.Art) ||
    type.includes(PdtTypes.Pcr)
  ) {
    traceWithRef("signedEuHealthCerts: Generating EU test cert...");
    const euTestCerts = createEuTestCert(
      parsedFhirBundle,
      reference,
      storedUrl
    );
    traceWithRef(euTestCerts);
    signedEuHealthCerts = await createEuSignedTestQr(euTestCerts);
    if (!signedEuHealthCerts.length) {
      throw new Error(
        `Generated EU Vacc Cert is invalid: signedEuHealthCerts has 0 entries`
      );
    }
  } else {
    traceWithRef(
      `signedEuHealthCerts: Unsupported test type - ${JSON.stringify(type)}`
    );
  }
  return signedEuHealthCerts;
};
