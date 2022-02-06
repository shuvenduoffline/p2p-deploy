#!/usr/bin/env node
const readline = require("readline");
const Writable = require("stream").Writable;
const {
  saveAccessKey,
  generateAndSaveKey,
} = require("./generateAccessKeyAndSave");
const fs = require("fs");
const commandExecutioner = require("./commandExecutioner");
const http = require("http");

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
const commands = ["start", "stop", "renew", "setup", "help", "deploy"];

// usage represents the help guide
const usage = function () {
  const usageText = `
  p2pd helps you updated deployed app on remote server.

  usage:
    p2pd <command>

    commands can be:

    start:    start/restart the p2pd server
    stop:     stop the p2pd server
    deploy:   update the code in remote machine
    renew:    update the exiting key
    setup:    used to mark a todo as complete
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

//if not a valid command
if (commands.indexOf(args[2]) == -1) {
  usage();
  return;
}

const takeKeyInput = () => {
  //if key file already exist then continue with key file
  if (fs.existsSync(Constant.KEY_FILE)) {
    console.log("Continuing with existing key...");
  } else {
    mutableStdout.muted = false;
    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });
    rl.question("Please enter access key :", function (input) {
      rl.close();
      if (!input || input.length !== 32) {
        console.log("\nInvalid Key Passed");
      } else {
        console.log("Updating access key!");
        saveAccessKey(input);
      }
    });

    mutableStdout.muted = true;
  }

  generateDefaultConfigFile();
};

const generateDefaultConfigFile = () => {
  if (!fs.existsSync(Constant.CONFIG_FILE_NAME)) {
    console.log(`
    Generating default configuration file : ${Constant.CONFIG_FILE_NAME}
    Please update it if required!
    `);
    generateConfigFile();
  } else {
    console.log(
      `Continuing with existing configuration file : ${Constant.CONFIG_FILE_NAME}`
    );
  }
};

const startTheProcess = () => {
  console.log("### Starting p2pd ###");

  //if access key not exits
  if (!fs.existsSync(Constant.KEY_FILE)) {
    console.log("Generating new access key");
    generateAndSaveKey();
  } else {
    console.log("Using existing key file..");
  }

  //check eco system config file missing or not
  if (!fs.existsSync("ecosystem.config.js")) {
    console.log("ecosystem config file missing");
    process.exit(1);
  }

  //starting server
  commandExecutioner("yarn")
    .then((result) => {
      console.log("### p2pd started successfully ###");
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
    "./" + Constant.CONFIG_FILE_NAME
  );
  console.log(p2pdConfig);

  const server = p2pdConfig.server;
  const port = p2pdConfig.port;

  //delete the port and server name
  delete p2pdConfig.server;
  delete p2pdConfig.port;

  //encrypt the text
  const encryptedCommands = encrypt(JSON.stringify(p2pdConfig));

  ///DO the http request
  http
    .get(`http://${server}:${port}?data=${encryptedCommands}`, (res) => {
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
  commandExecutioner(Constant.SERVICE_STOP_COMMAND)
    .then((result) => {
      console.log("### p2pd stopped successfully ###");
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
};

const updateKey = () => {
  //if access key not exits
  if (fs.existsSync(Constant.KEY_FILE)) {
    console.log("Removing existing file");
    fs.unlinkSync(Constant.KEY_FILE);
  }

  console.log("Generating new access key");
  generateAndSaveKey();
};

switch (args[2]) {
  case "help":
    usage();
    break;
  case "setup":
    takeKeyInput();
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
  case "renew":
    updateKey();
    break;
  default:
    errorLog("invalid command passed");
    usage();
}
