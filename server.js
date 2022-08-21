const http = require("http");
const commandExecutioner = require("./commandExecutioner");
const url = require("url");
const { decrypt } = require("./encryption");
const path = require("path/posix");
const Constant = require("./Constants");
const fs = require("fs");

const port = process.env.port || Constant.DEFAULT_PORT;
const requestListener = async function (req, res) {
  try {
    //request method should be get
    if (req.method !== "GET") return res.end("Method not allowed!");

    const encryptedCommand = url.parse(req.url, true).query?.data;

    if (!encryptedCommand) return res.end(Constant.SERVER_HELLO_MESSAGE);

    //console.log("Encrypted : " + encryptedCommand);
    res.writeHead(200, { "Content-Type": "text/plain" });

    const decryptedMessage = decrypt(encryptedCommand);
    const decryptedMessageObj = JSON.parse(decryptedMessage);
    console.log(decryptedMessageObj);

    const commandPath = path.join(
      decryptedMessageObj.basePath || Constants.BASE_PATH,
      decryptedMessageObj.directory
    );

    res.write(`Running command in : ${commandPath}`);

    if (!fs.existsSync(commandPath)) return res.end("Directory Do not exists");

    const steps = decryptedMessageObj.steps;

    //check if sudo or cd command present, then end execution
    for (let i = 0; i < steps.length; i++) {
      const command =  steps[i].command
      if(command.startWith('cd')){
        res.end("'cd'/change directory command is blocked/not allowed for security reason!");
        return
      }

      if(command.startWith('sudo')){
        res.end("'sudo' command is blocked/not allowed for security reason!");
        return
      }
    }


    for (let i = 0; i < steps.length; i++) {
      res.write(`Running step : ${steps[i].name}`);
      await commandExecutioner(steps[i].command, commandPath, res);
    }

    res.end("Execution Complete!!");
    //extract the data from request
  } catch (error) {
    res.end(`Something went wrong : ${error?.message}`);
  }
};

const server = http.createServer(requestListener);
server.listen(port, () =>
  console.log(`### P2P Deploy server started ###\nPort : ${port}`)
);
