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
const { rejects } = require("assert");
const util = require("util");

//stdout with hidden output
const mutableStdout = new Writable({
  write: function (chunk, encoding, callback) {
    if (!this.muted) process.stdout.write(chunk, encoding);
    // else process.stdout.write("*", encoding);
    callback();
  },
});

const args = process.argv;

//allowed commands
const commands = ["start", "stop", "keygen", "setup", "help", "deploy"];

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

  p2p-deploy helps you run set of command on remote server.

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

// usage represents the help guide
const usage = () => console.log(usageText);

// used to log errors to the console in red color
const errorLog = (error) => console.error(error);

// we make sure the length of the arguments is exactly three
if (args.length > 3) {
  errorLog(`only one argument can be accepted`);
  usage();
  return;
}


//below is unused as testing if server is now running at the time of configuration is not necessary 
/**
 * Check if server is reachable or not
 * @param {string} serverAddress
 * @returns
 */
const testIfServerAddressIsCorrect = (serverAddress) =>
  new Promise((resolve, rejects) => {
    let serverResponseTxt = "";
    http
      .get(serverAddress, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          serverResponseTxt += chunk;
        });
        res.on("end", () => {
          console.log(serverResponseTxt);
          resolve(serverAddress === Constant.SERVER_HELLO_MESSAGE);
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
        resolve(false);
      });
  });

/**
 * Ask Server address and return it
 */
const askServerAddress = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const question = util.promisify(rl.question).bind(rl);

  const address = await question(
    `Please enter server address (default ${Constant.DEFAULT_SERVER_ADDRESS}): `
  );

  rl.close();

  if (!address) return Constant.DEFAULT_SERVER_ADDRESS;

  if (!(address.startsWith("http://") || address.startsWith("https://"))) {
    console.log(
      "\nInvalid Hostname must start with 'http://' or 'https://', try again!\n"
    );
    return askServerAddress();
  }

  // //test if server is reach able not necessary we may setup server after this
  // const serverReachResult = await testIfServerAddressIsCorrect(address)

  // //if we can't reach the server
  // if(!serverReachResult){
  //   console.log('Unable to communicate with server : ' + address);
  //   return askServerAddress();
  // }

  return address;
};

//ask key and store it
const askKeyAndStore = () =>
  new Promise((resolve, reject) => {
    //if key file already exist then continue with key file
    if (fs.existsSync(Constant.KEY_FILE)) {
      console.log(`
    Continuing with existing key...
    If you need to update the key, please update the '${Constant.KEY_FILE}' file.
    `);
      return resolve();
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    mutableStdout.muted = false;

    rl.question("Please enter access key :", function (input) {
      mutableStdout.muted = false;
      rl.close();
      if (!input || input.length !== Constant.DEFAULT_KEY_LENGTH) {
        console.log("\nInvalid Key Length. Please try again!");
        return askKeyAndStore();
      } else {
        console.log("\nUpdating access key...");
        saveAccessKey(input, process.cwd());
        return resolve();
      }
    });
    mutableStdout.muted = true;
  });

const generateDefaultConfigFile = (serverAddress) => {
  if (!fs.existsSync(Constant.CONFIG_FILE_NAME)) {
    console.log(
      `Generating default configuration file : ${Constant.CONFIG_FILE_NAME} \nPlease update it as per your needs!`
    );
    generateConfigFile(serverAddress);
  } else {
    console.log(
      `Continuing with existing configuration file : ${Constant.CONFIG_FILE_NAME} \nPlease update it as per your needs!`
    );
  }
};

const startServer = () => {
  console.log(`
    _____ ___  _____        _____  ______ _____  _      ______     __
 |  __ \__ \|  __ \      |  __ \|  ____|  __ \| |    / __ \ \   / /
 | |__) | ) | |__) |_____| |  | | |__  | |__) | |   | |  | \ \_/ / 
 |  ___/ / /|  ___/______| |  | |  __| |  ___/| |   | |  | |\   /  
 | |    / /_| |          | |__| | |____| |    | |___| |__| | | |   
 |_|   |____|_|          |_____/|______|_|    |______\____/  |_|   

 Deployment service thats run on server and communicate directly with local machine                                                                  

 Dev : https://shuvenduoffline.github.io/
 Github : https://github.com/shuvenduoffline/p2p-deploy

 Starting service...                                                                
  `);


  const serverKeyFilePath = path.join(
    "etc",
    "p2p-deploy",
    "secret",
    Constant.KEY_FILE
  );

  //if access key not exits
  if (!fs.existsSync(serverKeyFilePath)) {
    // console.log("Please generate a access key first.");
    // console.log("Run 'p2p-deploy help' for more info");
    keygen();
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

  const serverKeyFilePath = path.join(
    "etc",
    "p2p-deploy",
    "secret",
    Constant.KEY_FILE
  );

  //if access key not exits
  if (fs.existsSync(serverKeyFilePath)) {
    console.log("Removing existing file");
    fs.unlinkSync(serverKeyFilePath);
  }

  console.log("Generating new access key...");
  generateAndSaveKey();
};

/**
 * Run on client machine to generate p2p-deploy configuration file
 */
const clientSideSetUp = async () => {
  const serverAddress = await askServerAddress();
  await askKeyAndStore();
  await generateDefaultConfigFile(serverAddress);
};

//bear bone run
// if (args.length === 2) {
//   startServer();
//   return;
// }

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
    clientSideSetUp();
    break;
  case "start":
    startServer();
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
    errorLog("Invalid command passed");
    usage();
}
