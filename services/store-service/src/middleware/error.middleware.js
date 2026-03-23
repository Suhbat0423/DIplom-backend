const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ message: "Validation error", errors: messages });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ message });
};
