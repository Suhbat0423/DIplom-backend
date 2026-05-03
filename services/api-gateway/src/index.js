const app = require("./app");
const { PORT } = require("./config/env");
const logger = require("./utils/logger");

const port = PORT || 3000;

const server = app.listen(port, "0.0.0.0", () => {
  logger.info(`API gateway running at http://0.0.0.0:${port}`);
});

function shutdown(signal) {
  logger.info(`Received ${signal}; shutting down API gateway`);

  server.close((err) => {
    if (err) {
      logger.error("Failed to close API gateway cleanly", err);
      process.exit(1);
    }

    process.exit(0);
  });
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});
