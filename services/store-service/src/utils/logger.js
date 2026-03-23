const fs = require("fs");
const path = require("path");
const winston = require("winston");

// ensure logs directory exists to avoid write errors
const logDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
  } catch (err) {
    // if directory cannot be created, we will fall back to console only
    console.warn(
      "Unable to create logs directory, file logging disabled:",
      err.message,
    );
  }
}

const transports = [];

// file transports only when directory is writable
if (fs.existsSync(logDir)) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  );
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "store-service" },
  transports,
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp }) =>
            `${timestamp} [${level}]: ${message}`,
        ),
      ),
    }),
  );
}

module.exports = logger;
