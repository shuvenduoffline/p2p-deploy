const { exec } = require("child_process");
const fs = require("fs");

/**
 * Run the command in the directory
 * @param {string} command
 * @param {string} cwd
 * @param {Response} res
 * @returns result in Response stream
 */
const commandExecutioner = (command, cwd = process.cwd(), res = null) =>
  new Promise((resolve, reject) => {
    //check if path exits
    if (!fs.existsSync(cwd)) return reject("Directory doesn't exists!!");

    //check if its a directory
    if (!fs.statSync(cwd).isDirectory())
      return reject("Path is not a directory!!");

    const options = { cwd };
    const childProcess = exec(command, options);

    childProcess.stdout.on("data", function (data) {
      console.log(data);
      res?.write(data);
    });
    ō;

    childProcess.stderr.on("data", function (data) {
      console.log(data);
      res?.write(data);
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve("Done!");
      } else {
        console.log(`Child process close all stdio with code ${code}`);
        res?.end("Something went wrong");
        reject("Something went wrong!");
      }
    });

    childProcess.on("exit", (code) => {
      console.log(`Child process exited with code ${code}`);
    });

    childProcess.on("error", (error) => {
      console.log("Error : " + error);
      res?.end("Couldn't create child process!" + error);
      reject("Couldn't create child process!" + error);
    });
  });

module.exports = commandExecutioner;
