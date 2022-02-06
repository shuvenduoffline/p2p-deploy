const https = require("https");

/**
 * Make a request to the internet and get the public ip address
 * @returns public ip
 */
const getPublicIp4Ip = () =>
  new Promise((resolve, reject) => {
    https
      .get("https://domains.google.com/checkip", (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
        reject(err);
      });
  });

module.exports = getPublicIp4Ip;
