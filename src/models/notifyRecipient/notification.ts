/* eslint-disable @typescript-eslint/camelcase */
/* copied from https://github.com/Notarise-gov-sg/api-notify/blob/master/src/model/notification/index.ts */
import { Static, String, Literal, Array, Record, Union } from "runtypes";
import { TestData } from "../healthCert";

const channel_mode = Union(Literal("SPM"), Literal("SPMORSMS"));
const delivery = Union(Literal("IMMEDIATE"), Literal("SCHEDULE"));

const templateInputV3 = Record({
  title: String,
  date: String,
  qrcode: String, // base64 qrcode content
  name: String,
  passport: String,
  testtype: String,
  testresult: String,
  testdatetime: String,
  testtype2: String,
  testresult2: String,
  testdatetime2: String
});

const templateInputV2 = Record({
  title: String,
  date: String,
  qrcode: String, // base64 qrcode content
  name: String,
  passport: String,
  testtype: String,
  testresult: String,
  testdatetime: String
});

const templateV2 = Record({
  template_id: Literal("SAFETRAVEL-QR-NTF-02"),
  template_input: templateInputV2
});

const templateV3 = Record({
  template_id: Literal("SAFETRAVEL-QR-NTF-03"),
  template_input: templateInputV3
});
const template_layout = Array(Union(templateV2, templateV3));

const cta = Record({
  action_name: String,
  action_url: String,
  action_type: String
});
const title = String;
const sender_name = String;
const sender_logo_small = String; // URL of logo
const category = Literal("MESSAGES");
const priority = Literal("HIGH");
const uin = String; // NRIC or FIN
const notification_req = Record({
  uin,
  channel_mode,
  delivery,
  template_layout,
  cta: Array(cta),
  title,
  sender_name,
  sender_logo_small,
  category,
  priority
});

const spmPayloadDef = Record({
  notification_req
});

export type SpmPayload = Static<typeof spmPayloadDef>;

type SpmTemplate = Static<typeof templateV2 | typeof templateV3>;

export const getSpmTemplateInput = (
  qrCode: string,
  passportNumber: string,
  testData: TestData[],
  validFrom: string
): SpmTemplate => {
  const templateId =
    testData.length > 1 ? "SAFETRAVEL-QR-NTF-03" : "SAFETRAVEL-QR-NTF-02";
  switch (templateId) {
    case "SAFETRAVEL-QR-NTF-02":
      return {
        template_id: templateId,
        template_input: {
          title: "COVID-19 HEALTHCERT",
          date: validFrom,
          qrcode: qrCode,
          name: testData[0].patientName,
          passport: passportNumber,
          testresult: "Negative",
          testtype:
            testData[0].testType === "REAL TIME RT-PCR SWAB"
              ? "COVID-19 PCR TEST RESULT"
              : testData[0].testType === "SEROLOGY"
              ? "COVID-19 SEROLOGY TEST RESULT"
              : testData[0].testType,
          testdatetime: testData[0].swabCollectionDate
        }
      };
    case "SAFETRAVEL-QR-NTF-03":
      return {
        template_id: templateId,
        template_input: {
          title: "COVID-19 HEALTHCERT",
          date: validFrom,
          qrcode: qrCode,
          name: testData[0].patientName,
          passport: passportNumber,
          testresult: "Negative",
          testtype:
            testData[0].testType === "REAL TIME RT-PCR SWAB"
              ? "COVID-19 PCR TEST RESULT"
              : testData[0].testType === "SEROLOGY"
              ? "COVID-19 SEROLOGY TEST RESULT"
              : testData[0].testType,
          testdatetime: testData[0].swabCollectionDate,
          testresult2: "Negative",
          testtype2:
            testData[1].testType === "REAL TIME RT-PCR SWAB"
              ? "COVID-19 PCR TEST RESULT"
              : testData[1].testType === "SEROLOGY"
              ? "COVID-19 SEROLOGY TEST RESULT"
              : testData[1].testType,
          testdatetime2: testData[1].swabCollectionDate
        }
      };
    default:
      throw new Error(`Invalid template ID: ${templateId}`);
  }
};
