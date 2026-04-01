const app = require("./app");
const { HOST, PORT } = require("./config/env");
const db = require("./config/database");
const logger = require("./utils/logger");

const host = HOST || "0.0.0.0";
const port = PORT || 3003;

async function start() {
  try {
    try {
      await db.connect();
    } catch (err) {
      logger.warn("Database not connected; continuing without DB");
    }

    app.listen(port, host, () => {
      logger.info(`Store service running at http://${host}:${port}`);
    });
  } catch (err) {
    logger.error("Failed to start application", err);
    process.exit(1);
  }
}

start();

module.exports = app;
