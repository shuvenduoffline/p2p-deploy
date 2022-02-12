const { writeFileSync } = require("fs");
const path = require("path");

const getDefaultData = (serverAddress) =>
  `module.exports = ${JSON.stringify({
    server: serverAddress,
    basePath: "/home/ubuntu",
    directory: path.basename(process.cwd()),
    steps: [
      {
        name: "Fetch data",
        command: "git pull",
      },
      {
        name: "Install Dependency",
        command: "yarn",
      },
      {
        name: "Build project",
        command: "yarn build",
      },
      {
        name: "Deploy project",
        command: "pm2 start",
      },
    ],
  })}`;

const generateConfigFile = (serverAddress) => {
  try {
    const data = getDefaultData(serverAddress);
    writeFileSync("p2pd.config.js", data);
  } catch (error) {
    console.log("Error : ", error);
    process.exit(1);
  }
};

module.exports = generateConfigFile;
