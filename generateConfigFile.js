const { writeFileSync } = require("fs");
const path = require("path");

const getDefaultData = () =>
  `module.exports = ${JSON.stringify({
    server: "localhost",
    port: 7861,
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
      // {
      //   name: "Deploy project",
      //   command: "pm2 start",
      // },
    ],
  })}`;

const generateConfigFile = () => {
  try {
    const data = getDefaultData();
    writeFileSync("p2pd.config.js", data);
  } catch (error) {
    console.log("Error : ", error);
    process.exit(1);
  }
};

module.exports = generateConfigFile;
