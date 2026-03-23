const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn("No authorization header provided");
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    // payload should contain: id, username, role, storeIds (etc.)
    req.user = payload;
    next();
  } catch (err) {
    logger.warn("JWT verification failed:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
