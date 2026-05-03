const { INTERNAL_API_KEY } = require("../config/env");

module.exports = (req, res, next) => {
  const apiKey = req.headers["x-internal-api-key"];
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ message: "Invalid internal API key" });
  }
  next();
};
