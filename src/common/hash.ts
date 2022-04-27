import { createHmac } from "crypto";

const saltAndHash = (id: string, vaultUinSalt: string) => {
  const hasher = createHmac("sha256", vaultUinSalt);
  return hasher.update(id).digest("hex");
};

export const hashIC = (ic: string, vaultUinSalt: string) =>
  saltAndHash(`nric-${ic}`, vaultUinSalt);
