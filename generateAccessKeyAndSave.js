const { writeFileSync } = require("fs");
const path = require("path");

const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
// const allUniqueChars = [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`];
const allNumbers = [..."0123456789"];

const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha];

const generator = (base, len) => {
  return [...Array(len)]
    .map((i) => base[(Math.random() * base.length) | 0])
    .join("");
};

const generateAndSaveKey = () => {
  const generatedPassword = generator(base, 32);
  console.log("New access key generated!");
  console.log(
    "Please use the updated access key in your local machine to deploy app"
  );
  console.log("Access key : " + generatedPassword);
  saveAccessKey(generatedPassword);
};

const saveAccessKey = (generatedPassword, dir = __dirname) => {
  if (!generatedPassword) throw new Error("key require");
  try {
    writeFileSync(path.join(dir,".key"), generatedPassword);
    return generatedPassword;
  } catch (err) {
    console.log(`Something went wrong!`);
    console.log(err);
  }
};

module.exports = { generateAndSaveKey, saveAccessKey };
