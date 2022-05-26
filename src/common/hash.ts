import { createHmac } from "crypto";
import { getDefaultIfUndefined } from "../config";

const saltAndHash = (id: string) => {
  const hasher = createHmac(
    "sha256",
    getDefaultIfUndefined(process.env.VAULT_UIN_SALT, "")
  );
  return hasher.update(id).digest("hex");
};

export const hashIC = (ic: string) => saltAndHash(`nric-${ic}`);
