import { createHmac } from "crypto";
import { config } from "../config";
import { getLogger } from "./logger";

const { trace } = getLogger("src/common/hash");

const saltAndHash = (id: string) => {
  trace("vaultUinSalt : ", config.vaultUinSalt);
  const hasher = createHmac("sha256", config.vaultUinSalt);
  return hasher.update(id).digest("hex");
};

export const hashIC = (ic: string) => saltAndHash(`nric-${ic}`);
