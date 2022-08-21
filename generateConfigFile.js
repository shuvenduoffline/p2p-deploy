const { writeFileSync } = require("fs");
const path = require("path");
const Constants = require("./Constants");

/**
 * Generate default commands
 * @param {string} serverAddress 
 * @returns 
 */
const getDefaultData = (serverAddress) =>
  `module.exports = ${JSON.stringify({
    server: serverAddress,
    basePath: Constants.BASE_PATH,
    directory: path.basename(process.cwd()),
    steps: [
      {
        name: 'Fetch data',
        command: `git -c credential.helper='!f() { echo "username=YOUR_GITHUB_USER_NAME"; echo "password=YOUR_GITHUB_ACCESS_TOKEN"; }; f' pull`,
      },
      { name: 'Install Dependency', command: 'yarn' },
      { name: 'Build project', command: 'yarn build' },
      { name: 'Deploy project', command: 'pm2 start' },
    ],
  })}`;


/**
 * Generate default commands configuration file
 * @param {string} serverAddress 
 */
const generateConfigFile = (serverAddress) => {
  try {
    const data = getDefaultData(serverAddress);
    writeFileSync(Constants.CONFIG_FILE_NAME, data);
  } catch (error) {
    console.log("Error : ", error);
    process.exit(1);
  }
};

module.exports = generateConfigFile;
