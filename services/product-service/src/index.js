const express = require("express");
const routes = require("./routes");
const { HOST, PORT } = require("./config/env");
const db = require("./config/database");
const errorHandler = require("./middleware/error.middleware");
const logger = require("./utils/logger");

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);

const host = HOST || "0.0.0.0";
const port = PORT || 3000;

async function start() {
  try {
    try {
      await db.connect();
    } catch (err) {
      logger.warn("Database not connected; continuing without DB");
    }

    app.listen(port, host, () => {
      logger.info(`Product service running at http://${host}:${port}`);
    });
  } catch (err) {
    logger.error("Failed to start application", err);
    process.exit(1);
  }
}

start();

module.exports = app;
