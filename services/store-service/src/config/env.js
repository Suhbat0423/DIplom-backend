require("dotenv").config();

module.exports = {
  HOST: process.env.HOST || "0.0.0.0",
  PORT: process.env.PORT || 3003,
  // Accept either variable name: MONGODB_URI or MONGO_URI
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/store-service",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
