const http = require("http");
const commandExecutioner = require("./commandExecutioner");
const url = require("url");
const { decrypt } = require("./encryption");
const path = require("path/posix");
const Constants = require("./Constants");
const fs = require("fs");

const port = process.env.port || 7861;
const requestListener = async function (req, res) {
  try {
    //request method should be get
    if (req.method !== "GET") return res.end("Method not allowed!");

    const encryptedCommand = url.parse(req.url, true).query?.data;

    if (!encryptedCommand) return res.end("Hello from p2p deploy service!");

    console.log("Encrypted : " + encryptedCommand);
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
    for (let i = 0; i < steps.length; i++) {
      console.log("Running step : " + steps[i].name);
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
