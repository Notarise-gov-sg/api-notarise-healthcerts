import { wrapDocument, v2 } from "@govtechsg/open-attestation";
import {
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/oa-did-sign";
import { writeFileSync } from "fs";
import { config } from "../src/config";
import sample from "../test/fixtures/v1/example_healthcert_with_nric_unwrapped.json";

const OUTPUT_FILE = "test/fixtures/v1/example_healthcert_with_nric_wrapped.json";

const run = async () => {
  const healthCert = sample as v2.OpenAttestationDocument;
  const wrappedHealthCert = wrapDocument(healthCert);
  const signedDocument = await signDocument(
    wrappedHealthCert,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    config.didSigner.key,
    config.didSigner.privateKey
  );
  writeFileSync(OUTPUT_FILE, JSON.stringify(signedDocument, null, 2));
};

run();
