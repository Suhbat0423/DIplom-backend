const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

mongoose.set("strictQuery", false);

async function connect() {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set; skipping database connection");
    return null;
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");
    return mongoose.connection;
  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err && err.message ? err.message : err,
    );
    throw err;
  }
}

module.exports = { connect, mongoose };
