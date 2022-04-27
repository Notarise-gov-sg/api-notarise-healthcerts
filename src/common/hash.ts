import { createHmac } from "crypto";
import { getDefaultIfUndefined } from "../config";
import { getLogger } from "./logger";

const { trace } = getLogger("src/common/hash");

const saltAndHash = (id: string) => {
  trace(
    "vaultUinSalt : ",
    getDefaultIfUndefined(process.env.VAULT_UIN_SALT, "")
  );
  const hasher = createHmac(
    "sha256",
    getDefaultIfUndefined(process.env.VAULT_UIN_SALT, "")
  );
  return hasher.update(id).digest("hex");
};

export const hashIC = (ic: string) => saltAndHash(`nric-${ic}`);
