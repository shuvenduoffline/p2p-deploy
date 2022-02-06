module.exports = {
  server: "localhost",
  port: 7861,
  basePath: "/home/ubuntu",
  directory: "p2p-deploy",
  steps: [
    { name: "Install Dependency", command: "yarn" },
    { name: "Build project", command: "yarn build" },
  ],
};
