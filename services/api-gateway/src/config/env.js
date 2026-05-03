require("dotenv").config();

function normalizeUrl(value, fallback) {
  const raw = value || fallback;
  return raw ? raw.replace(/\/+$/, "") : raw;
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  USER_SERVICE_URL: normalizeUrl(
    process.env.USER_SERVICE_URL,
    "http://localhost:3001",
  ),
  PRODUCT_SERVICE_URL: normalizeUrl(
    process.env.PRODUCT_SERVICE_URL,
    "http://localhost:3002",
  ),
  STORE_SERVICE_URL: normalizeUrl(
    process.env.STORE_SERVICE_URL,
    "http://localhost:3003",
  ),
  CART_SERVICE_URL: normalizeUrl(
    process.env.CART_SERVICE_URL,
    "http://localhost:3004",
  ),
  ORDER_SERVICE_URL: normalizeUrl(
    process.env.ORDER_SERVICE_URL,
    "http://localhost:3005",
  ),
  PAYMENT_SERVICE_URL: normalizeUrl(
    process.env.PAYMENT_SERVICE_URL,
    "http://localhost:3006",
  ),
};
