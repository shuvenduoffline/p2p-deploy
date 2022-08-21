const { writeFileSync } = require("fs");
const path = require("path");
const Constants = require("./Constants");

const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
const allUniqueChars = [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`];
const allNumbers = [..."0123456789"];

//character space for our password
const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha,...allUniqueChars];

/**
 * Generate a random password
 * @param {array of chars} base 
 * @param {number} len 
 * @returns 
 */
const generator = (base, len) => {
  return [...Array(len)]
    .map((i) => base[(Math.random() * base.length) | 0])
    .join("");
};

const generateAndSaveKey = () => {
  const generatedPassword = generator(base, 32);
  console.log("Access key : " + generatedPassword);
  console.log(
    "Please use this access key in your local machine for configuration"
  );
  const serverKeyFilePath = path.join(
    "etc",
    "p2p-deploy",
    "secret"
  );
  saveAccessKey(generatedPassword,serverKeyFilePath);
};

const saveAccessKey = (generatedPassword, dir = __dirname) => {
  if (!generatedPassword) throw new Error("key require");
  try {
    writeFileSync(path.join(dir,Constants.KEY_FILE), generatedPassword);
    return generatedPassword;
  } catch (err) {
    console.log(`Something went wrong!`);
    console.log(err);
  }
};

module.exports = { generateAndSaveKey, saveAccessKey };
