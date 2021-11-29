import {
  wrapDocument,
  v2,
  signDocument,
  SUPPORTED_SIGNING_ALGORITHM,
} from "@govtechsg/open-attestation";
import { writeFileSync } from "fs";
import { config } from "../src/config";
import sample from "../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";

const OUTPUT_FILE = "test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";

const run = async () => {
  const healthCert = sample as v2.OpenAttestationDocument;
  const wrappedHealthCert = wrapDocument(healthCert);
  const signedDocument = await signDocument(
    wrappedHealthCert,
    SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
    {
      public: config.didSigner.key,
      private: config.didSigner.privateKey,
    }
  );
  writeFileSync(OUTPUT_FILE, JSON.stringify(signedDocument, null, 2));
};

run();
