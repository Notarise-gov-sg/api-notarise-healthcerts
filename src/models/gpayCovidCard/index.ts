import GPay, {
  PatientDetails,
  BasicDetails,
  TestingRecord,
} from "@notarise-gov-sg/gpay-covid-cards";
import { ParsedBundle } from "../../models/fhir/types";
import { isoToDateOnlyString, isoToLocaleString } from "../../common/datetime";
import { getDefaultIfUndefined } from "../../config";

const genGPayCovidCardUrl = (
  gpaySigner: { issuer: string; issuerId: string },
  parsedFhirBundle: ParsedBundle,
  uuid: string,
  storedUrl: string
) => {
  const privateKey = getDefaultIfUndefined(
    process.env.GPAY_COVID_CARD_PRIVATE_KEY,
    ""
  ).replace(/\\n/g, "\n");
  const gpay = GPay(privateKey);

  const patientDetails: PatientDetails = {
    dateOfBirth: isoToDateOnlyString(parsedFhirBundle.patient.birthDate),
    patientId: parsedFhirBundle.patient.passportNumber,
    patientIdLabel: "Passport Number",
    patientName: parsedFhirBundle.patient.fullName,
    // identityAssuranceLevel: "IAL1.4",
  };

  const basicDetails: BasicDetails = {
    iss: gpaySigner.issuer,
    uuid,
    issuerId: gpaySigner.issuerId,
    title: "COVID-19 Test Result", // Hard-coded for api-notarise-healthcerts
    qr: storedUrl,
    patientDetails: gpay.genPatientDetails(patientDetails),
    // expiration: "2021-10-01",
  };

  const testRecords = parsedFhirBundle.observations.map((o) =>
    gpay.genTestingRecord({
      specimen: o.specimen.swabType.display as TestingRecord["specimen"], // E.g. "Nasopharyngeal swab"
      administrationDateTime: isoToLocaleString(o.specimen.collectionDateTime), // I.e. Specimen collection datetime
      reportDateTime: isoToLocaleString(o.observation.effectiveDateTime), // I.e. Observation effective datetime
      provider: o.organization.lhp.fullName, // E.g. "MacRitchie Medical Clinic"
      contactInfo: o.organization.lhp.address.text, // E.g. "MacRitchie Hospital, Thomson Road, Singapore 123000"
      testCode: o.observation.testType.code as TestingRecord["testCode"], // E.g. "94531-1"
      testDescription: o.observation.testType
        .display as TestingRecord["testDescription"], // E.g. "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection"
      testResultCode: o.observation.result
        .code as TestingRecord["testResultCode"], // E.g. "260385009"
      testResultDescription: o.observation.result
        .display as TestingRecord["testResultDescription"], // E.g. "Negative"
    })
  );

  const payload = gpay.genGPayCovidCard(basicDetails, testRecords);
  const signedPayload = gpay.signPayload(payload);

  return gpay.generateFullUrl(signedPayload);
};

export { genGPayCovidCardUrl };
