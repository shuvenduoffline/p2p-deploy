const { throws } = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  if (!fs.existsSync(".key"))
    throw new Error("'.key' file is missing! Please generate a key first!");
  const ENCRYPTION_KEY = fs.readFileSync(".key", "utf8");
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  if (!fs.existsSync(path.join(__dirname,".key")))
    throw new Error("'.key' file is missing! Please generate a key first!");
  const ENCRYPTION_KEY = fs.readFileSync(".key", "utf8");
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
