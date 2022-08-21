module.exports = {
  CONFIG_FILE_NAME: "p2pd.config.js",
  KEY_FILE: ".key",
  SERVICE_START_COMMAND: "pm2 start",
  SERVICE_STOP_COMMAND: "pm2 stop p2p_deploy",
  BASE_PATH: "/home/ubuntu",
  PM2_ECOSYSTEM_FILE : "ecosystem.config.js",
  DEFAULT_PORT : 7861,
  DEFAULT_KEY_LENGTH : 32,
  SERVER_HELLO_MESSAGE : 'Hello from p2p deploy service!',
  DEFAULT_SERVER_ADDRESS : 'http://localhost:7861'
};
