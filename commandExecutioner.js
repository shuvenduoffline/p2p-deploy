const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const commandExecutioner = (command, cwd = process.cwd(), res = null) =>
  new Promise((resolve, reject) => {
    console.log(command);
    console.log(cwd);
    // console.log(res);

    //check if path exits
    if (!fs.existsSync(cwd)) return reject("Directory doesn't exists!!");

    //check if its a directory
    if (!fs.statSync(cwd).isDirectory())
      return reject("Path is not a directory!!");

    const options = { cwd };
    console.log(options);
    const childProcess = exec(command, options);

    childProcess.stdout.on("data", function (data) {
      console.log(data);
      res?.write(data);
    });

    childProcess.stderr.on("data", function (data) {
      console.log(data);
      res?.write(data);
    });

    childProcess.on("close", (code) => {
      // console.log(`child process close all stdio with code ${code}`);
      if (code === 0) {
        resolve("Done!");
      } else {
        res?.end("Something went wrong");
        reject("Something went wrong!");
      }
    });

    childProcess.on("exit", (code) => {
      // console.log(`child process exited with code ${code}`);
    });

    childProcess.on("error", (error) => {
      console.log("Error : " + error);
      res?.end("Couldn't create child process!" + error);
      reject("Couldn't create child process!" + error);
    });
  });

module.exports = commandExecutioner;
