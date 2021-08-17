import { getData, v2, WrappedDocument } from "@govtechsg/open-attestation";
import { NotarisationMetadata } from "@govtechsg/oa-schemata/dist/types/__generated__/sg/gov/tech/notarise/1.0/schema";
import { Bundle } from "src/models/fhir/types";
import { config } from "../../../config";
import { HealthCertDocument, NotarizedHealthCert } from "../../../types";

const { didSigner } = config;

export const createUnwrappedDocument = (
  certificate: WrappedDocument<HealthCertDocument>,
  parseFhirBundle: Bundle,
  reference: string,
  storedUrl: string
): NotarizedHealthCert => {
  const certificateData =
    getData<WrappedDocument<HealthCertDocument>>(certificate);
  const passportNumber = parseFhirBundle.patient?.passportNumber;
  const b64Certificate = Buffer.from(JSON.stringify(certificate)).toString(
    "base64"
  );
  const dateString = new Date().toISOString();

  const $template = {
    name: "HEALTH_CERT",
    type: v2.TemplateType.EmbeddedRenderer,
    url: "https://healthcert.renderer.moh.gov.sg/",
  };

  const notarisationMetadata: NotarisationMetadata = {
    reference,
    notarisedOn: dateString,
    passportNumber: passportNumber || "",
    url: storedUrl,
  };

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

  const { version, type, fhirVersion, fhirBundle, logo } = certificateData;

  return {
    id: reference,
    version,
    type,
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
