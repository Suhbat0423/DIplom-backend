const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "No authorization token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
