import { createHmac } from "crypto";
import { config } from "../config";

const saltAndHash = (id: string) => {
  const hasher = createHmac("sha256", config.vaultUinSalt);
  return hasher.update(id).digest("hex");
};

export const hashIC = (ic: string) => saltAndHash(`nric-${ic}`);
