module.exports = {
  server: "http://localhost:7861",
  basePath: "/home/ubuntu",
  directory: "p2p-deploy",
  steps: [
    { name: "Fetch data", command: "git pull" },
    { name: "Install Dependency", command: "yarn" },
    { name: "Build project", command: "yarn build" },
    { name: "Deploy project", command: "pm2 start" },
  ],
};
