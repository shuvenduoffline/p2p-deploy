const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Constant = require("./Constants");

const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt the string with the key file
 * @param {string} text
 * @returns encrypted string
 */
function encrypt(text) {
  if (!fs.existsSync(Constant.KEY_FILE))
    throw new Error(
      `'${Constant.KEY_FILE}' file is missing! Please generate a key first!`
    );
  const ENCRYPTION_KEY = fs.readFileSync(Constant.KEY_FILE, "utf8");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Given a encrypted text its decrypt it
 * @param {string} text
 * @returns decrypted text
 */
function decrypt(text) {
  const keyFilePath = path.join(
    "etc",
    "p2p-deploy",
    "secret",
    Constant.KEY_FILE
  );
  if (!fs.existsSync(keyFilePath))
    throw new Error(
      `'${Constant.KEY_FILE}' file is missing! Please generate a key first!`
    );
  const ENCRYPTION_KEY = fs.readFileSync(Constant.KEY_FILE, "utf8");
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
