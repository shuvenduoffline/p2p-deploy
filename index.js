#!/usr/bin/env node
const readline = require("readline");
const Writable = require("stream").Writable;
const {
  saveAccessKey,
  generateAndSaveKey,
} = require("./generateAccessKeyAndSave");
const fs = require("fs");
const path = require("path");
const commandExecutioner = require("./commandExecutioner");
const http = require("http");
const { pathToFileURL } = require("url");
const generateConfigFile = require("./generateConfigFile");
const Constant = require("./Constants");
const { encrypt } = require("./encryption");

const mutableStdout = new Writable({
  write: function (chunk, encoding, callback) {
    if (!this.muted) process.stdout.write(chunk, encoding);
    callback();
  },
});

const args = process.argv;

//allowed commands
const commands = ["start", "stop", "keygen", "setup", "help", "deploy"];

// usage represents the help guide
const usage = function () {
  const usageText = `
      _____ ___  _____        _____  ______ _____  _      ______     __
  |  __ \__ \|  __ \      |  __ \|  ____|  __ \| |    / __ \ \   / /
  | |__) | ) | |__) |_____| |  | | |__  | |__) | |   | |  | \ \_/ / 
  |  ___/ / /|  ___/______| |  | |  __| |  ___/| |   | |  | |\   /  
  | |    / /_| |          | |__| | |____| |    | |___| |__| | | |   
  |_|   |____|_|          |_____/|______|_|    |______\____/  |_|   

  Deployment service thats run on server and communicate directly with local machine                                                                  

  Dev : https://shuvenduoffline.github.io/
  Github : https://github.com/shuvenduoffline/p2p-deploy

  p2p-deploy helps you updated deployed app on remote server.

  usage:
    p2p-deploy <command>

    commands can be:

    start:    start/restart the p2pd server (run on server.  do not use sudo)
    stop:     stop the p2pd server   (run on server)
    deploy:   update the code in remote machine  (run on client)
    keygen:   delete if key exists, generate new key (run with sudo)
    setup:    used to generate config file  (run on repro you wants to deploy)
    help:     used to print the usage guide 
  `;

  console.log(usageText);
};

// used to log errors to the console in red color
function errorLog(error) {
  console.error(error);
}

// we make sure the length of the arguments is exactly three
if (args.length > 3) {
  errorLog(`only one argument can be accepted`);
  usage();
  return;
}

const askServerAddress = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  rl.question(
    "Please enter server address (default http://localhost:7861): ",
    function (address) {
      rl.close();
      if (!address) return takeKeyInput("http://localhost:7861");

      if (!(address.startsWith("http://") || address.startsWith("https://"))) {
        console.log("\nInvalid Hostname, try again!\n");
        return askServerAddress();
      } else {
        takeKeyInput(address);
      }
    }
  );
};

const takeKeyInput = (serverAddress) => {
  //if key file already exist then continue with key file
  if (fs.existsSync(Constant.KEY_FILE)) {
    console.log(`
    Continuing with existing key...
    If you need to update the key, please update the '.key' file.
    `);
    generateDefaultConfigFile(serverAddress);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    mutableStdout.muted = false;
    rl.question("Please enter access key :", function (input) {
      rl.close();
      if (!input || input.length !== 32) {
        console.log("\nInvalid Key Passed");
      } else {
        console.log("\nUpdating access key!");
        saveAccessKey(input, process.cwd());
      }
      generateDefaultConfigFile(serverAddress);
    });

    mutableStdout.muted = true;
  }
};

const generateDefaultConfigFile = (serverAddress) => {
  if (!fs.existsSync(Constant.CONFIG_FILE_NAME)) {
    console.log(`
    Generating default configuration file : ${Constant.CONFIG_FILE_NAME}
    Please update it if required!
    `);
    generateConfigFile(serverAddress);
  } else {
    console.log(
      `
    Continuing with existing configuration file : ${Constant.CONFIG_FILE_NAME}
    Please update it if required!
      `
    );
  }
};

const startTheProcess = () => {
  console.log(`
    _____ ___  _____        _____  ______ _____  _      ______     __
 |  __ \__ \|  __ \      |  __ \|  ____|  __ \| |    / __ \ \   / /
 | |__) | ) | |__) |_____| |  | | |__  | |__) | |   | |  | \ \_/ / 
 |  ___/ / /|  ___/______| |  | |  __| |  ___/| |   | |  | |\   /  
 | |    / /_| |          | |__| | |____| |    | |___| |__| | | |   
 |_|   |____|_|          |_____/|______|_|    |______\____/  |_|   

 Deployement service thats run on server and communicate directy with local machine                                                                  

 Dev : https://shuvenduoffline.github.io/
 Github : https://github.com/shuvenduoffline/p2p-deploy

 Starting service...                                                                
  `);

  //if access key not exits
  if (!fs.existsSync(path.join(__dirname, Constant.KEY_FILE))) {
    console.log("Please generate a access key first.");
    console.log("Run 'p2p-deploy help' for more info");
    return;
  } else {
    console.log("Using existing key file..");
  }

  //check eco system config file missing or not
  if (!fs.existsSync(path.join(__dirname, Constant.PM2_ECOSYSTEM_FILE))) {
    console.log("ecosystem config file missing");
    process.exit(1);
  }

  //starting server
  commandExecutioner(Constant.SERVICE_START_COMMAND, __dirname)
    .then((result) => {
      console.log("### p2p-deploy started successfully ###");
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};

const startDeploymentProcess = async () => {
  //check config file present
  if (!fs.existsSync(Constant.CONFIG_FILE_NAME)) {
    console.log(`Config file : ${Constant.CONFIG_FILE_NAME} is missing`);
    process.exit(1);
  }

  //check key file present
  if (!fs.existsSync(Constant.KEY_FILE)) {
    console.log(`Key file : ${Constant.KEY_FILE} is missing`);
    process.exit(1);
  }

  const { default: p2pdConfig } = await import(
    pathToFileURL(path.join(process.cwd(), Constant.CONFIG_FILE_NAME)).href
  );
  console.log("Configuration : ");
  console.log(p2pdConfig);

  const server = p2pdConfig.server;

  //delete the port and server name
  delete p2pdConfig.server;

  //encrypt the text
  const encryptedCommands = encrypt(JSON.stringify(p2pdConfig));

  ///DO the http request
  http
    .get(`${server}?data=${encryptedCommands}`, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        console.log(chunk);
      });
      res.on("end", () => {
        console.log("Done!!!");
      });
    })
    .on("error", (err) => {
      console.log("Error: ", err.message);
    });
};

//stopping the service
const stopService = () => {
  commandExecutioner(Constant.SERVICE_STOP_COMMAND, __dirname)
    .then((result) => {
      console.log("### p2p-deploy stopped successfully ###");
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};

const keygen = () => {
  //if access key not exits
  if (fs.existsSync(path.join(__dirname, Constant.KEY_FILE))) {
    console.log("Removing existing file");
    fs.unlinkSync(path.join(__dirname, Constant.KEY_FILE));
  }

  console.log("Generating new access key");
  generateAndSaveKey();
};

//bear bone run
if (args.length === 2) {
  startTheProcess();
  return;
}

//if not a valid command
if (commands.indexOf(args[2]) == -1) {
  usage();
  return;
}

switch (args[2]) {
  case "help":
    usage();
    break;
  case "setup":
    askServerAddress();
    break;
  case "start":
    startTheProcess();
    break;
  case "deploy":
    startDeploymentProcess();
    break;
  case "stop":
    stopService();
    break;
  case "keygen":
    keygen();
    break;
  default:
    errorLog("invalid command passed");
    usage();
}
