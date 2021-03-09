import { HealthCertDocument } from "../types";

const getPatientFromHealthCert = (document: HealthCertDocument) => {
  return document.fhirBundle.entry.find(
    entry => entry.resourceType === "Patient"
  );
};

export const getParticularsFromHealthCert = (document: HealthCertDocument) => {
  const patient = getPatientFromHealthCert(document);

  const nric = patient?.identifier.find(
    identifierEntry =>
      identifierEntry.type instanceof Object &&
      identifierEntry.type.text === "NRIC"
  );
  const ppn = patient?.identifier.find(
    identifierEntry => identifierEntry.type === "PPN"
  );

  if (ppn === undefined) {
    throw new Error("Healthcert Malformed");
  }

  return { nric: nric?.value, passportNumber: ppn.value };
};
