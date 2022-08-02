import { WrappedDocument } from "@govtechsg/open-attestation";
import axios from "axios";
import { PDTHealthCertV2, RevocationResult } from "../../types";
import { getLogger } from "../../common/logger";
import { config } from "../../config";

const { trace } = getLogger(
  "src/functionHandlers/revokePdtHealthCert/revokePdtHealthCert"
);

export const revokePdtHealthcert = async (
  reference: string,
  certificate: WrappedDocument<PDTHealthCertV2>
): Promise<RevocationResult> => {
  const traceWithRef = trace.extend(`reference:${reference}`);

  const headers = {
    "x-api-key": `${config.revocationOcsp.apiKey}`,
    "Content-Type": "application/json",
  };
  const body = {
    documentHash: `0x${certificate.signature.targetHash}`,
    reasonCode: 3,
  };

  const response = await axios.post(config.revocationOcsp.endpoint, body, {
    headers,
  });

  traceWithRef(`OCSP Revocation status ${response.data.message}`);

  return response.data;
};
