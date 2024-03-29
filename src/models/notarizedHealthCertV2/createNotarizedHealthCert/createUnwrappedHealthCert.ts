import { getData, v2, WrappedDocument } from "@govtechsg/open-attestation";
import { notarise } from "@govtechsg/oa-schemata";
import { maskNricInFhirBundle } from "../../../common/maskNricFin";
import { ParsedBundle } from "../../fhir/types";
import { config } from "../../../config";
import { PDTHealthCertV2, EndorsedPDTHealthCertV2 } from "../../../types";

const { didSigner, revocationOcsp } = config;

export const createUnwrappedDocument = (
  certificate: WrappedDocument<PDTHealthCertV2>,
  parseFhirBundle: ParsedBundle,
  reference: string,
  storedUrl: string,
  signedEuHealthCerts?: notarise.SignedEuHealthCert[]
): EndorsedPDTHealthCertV2 => {
  const certificateData =
    getData<WrappedDocument<PDTHealthCertV2>>(certificate);
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
      revocation: revocationOcsp.endpoint
        ? {
            type: v2.RevocationType.OcspResponder,
            location: revocationOcsp.endpoint,
          }
        : {
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
    fhirBundle: maskNricInFhirBundle(fhirBundle),
    issuers,
    $template,
    notarisationMetadata,
    logo,
    attachments,
  };
};
