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
    "mongodb://localhost:27017/payment-service",
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || "http://localhost:3005",
  INTERNAL_API_KEY:
    process.env.INTERNAL_API_KEY ||
    process.env.ORDER_INTERNAL_API_KEY ||
    "local-dev-internal-key",
};
