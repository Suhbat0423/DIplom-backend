const app = require("./app");
const { HOST, PORT } = require("./config/env");
const db = require("./config/database");
const logger = require("./utils/logger");

const host = HOST || "0.0.0.0";
const port = PORT || 3002;

let server;

async function shutdown(signal) {
  logger.info(`Received ${signal}; shutting down product service`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  if (db.mongoose && db.mongoose.connection.readyState !== 0) {
    await db.mongoose.disconnect();
  }
}

async function start() {
  try {
    await db.connect();

    server = app.listen(port, host, () => {
      logger.info(`Product service running at http://${host}:${port}`);
    });
  } catch (err) {
    logger.error("Failed to start application", err);
    process.exit(1);
  }
}

start();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    try {
      await shutdown(signal);
      process.exit(0);
    } catch (err) {
      logger.error("Failed to shut down product service cleanly", err);
      process.exit(1);
    }
  });
});

module.exports = app;
