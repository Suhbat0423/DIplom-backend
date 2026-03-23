const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { MONGODB_URI } = require("./env");

const db = {
  connect: async () => {
    try {
      // mongoose 6+ parses the URI and uses appropriate defaults; extra options are deprecated
      await mongoose.connect(MONGODB_URI);

      logger.info("Connected to MongoDB");
    } catch (err) {
      logger.error("MongoDB connection error:", err);
      throw err;
    }
  },

  disconnect: async () => {
    try {
      await mongoose.disconnect();
      logger.info("Disconnected from MongoDB");
    } catch (err) {
      logger.error("MongoDB disconnection error:", err);
      throw err;
    }
  },
};

module.exports = db;
