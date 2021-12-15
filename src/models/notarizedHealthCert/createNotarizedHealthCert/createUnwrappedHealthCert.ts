import { getData, v2, WrappedDocument } from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import { getNricObjV1, maskNRIC } from "../../fhir";
import { config } from "../../../config";
import { HealthCertDocument, NotarizedHealthCert } from "../../../types";
import { getParticularsFromHealthCert } from "../../healthCert";

const { didSigner, documentName } = config;

export const createUnwrappedDocument = (
  certificate: WrappedDocument<HealthCertDocument>,
  reference: string,
  storedUrl: string,
  signedEuHealthCerts?: notarise.SignedEuHealthCert[]
): NotarizedHealthCert => {
  const certificateData =
    getData<WrappedDocument<HealthCertDocument>>(certificate);
  const { passportNumber } = getParticularsFromHealthCert(certificateData);
  const b64Certificate = Buffer.from(JSON.stringify(certificate)).toString(
    "base64"
  );
  const dateString = new Date().toISOString();

  const $template = {
    name: "HEALTH_CERT",
    type: v2.TemplateType.EmbeddedRenderer,
    url: "https://healthcert.renderer.moh.gov.sg/",
  };

  const notarisationMetadata: notarise.NotarisationMetadata = {
    reference,
    notarisedOn: dateString,
    passportNumber: passportNumber || "",
    url: storedUrl,
  };
  if (signedEuHealthCerts && signedEuHealthCerts.length > 0) {
    notarisationMetadata.signedEuHealthCerts = signedEuHealthCerts;
  }

  const attachments = [
    {
      filename: "healthcert.txt",
      type: "text/open-attestation",
      data: b64Certificate,
    },
  ];

  const issuers = [
    {
      name: didSigner.name,
      id: didSigner.id,
      revocation: {
        type: v2.RevocationType.None,
      },
      identityProof: {
        type: v2.IdentityProofType.DNSDid,
        location: didSigner.dns,
        key: didSigner.key,
      },
    },
  ];

  const nricIdentifier = getNricObjV1(certificateData);
  if (nricIdentifier != null) {
    nricIdentifier.value = maskNRIC(nricIdentifier.value);
  }

  const { fhirVersion, fhirBundle, logo } = certificateData;

  return {
    id: reference,
    name: documentName,
    validFrom: certificateData.validFrom,
    fhirVersion,
    fhirBundle,
    issuers,
    $template,
    notarisationMetadata,
    logo,
    attachments,
  };
};
