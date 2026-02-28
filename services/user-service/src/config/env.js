require("dotenv").config();

function normalizeHost(raw) {
  if (!raw) return raw;
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const u = new URL(raw);
      return u.hostname;
    }
  } catch (e) {
    // fallthrough
  }
  return raw;
}

module.exports = {
  HOST: normalizeHost(process.env.HOST),
  PORT: process.env.PORT,
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DB_URL ||
    "mongodb://localhost:27017/user-service",
};
