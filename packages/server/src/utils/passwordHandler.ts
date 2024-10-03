import crypto from "crypto";

export const encryptPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return { hash, salt };
};

export const verifyPassword = (
  password: string,
  hashFromDB: string,
  saltFromDB: string
) => {
  const candidateHash = crypto
    .pbkdf2Sync(password, saltFromDB, 1000, 64, "sha512")
    .toString("hex");

  return hashFromDB === candidateHash;
};
