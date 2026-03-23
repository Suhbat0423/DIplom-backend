const logger = require("../utils/logger");

// middleware to check if user is seller or admin
const requireSellerOrAdmin = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole === "seller" || userRole === "admin") {
    return next();
  }

  logger.warn(
    `User ${req.user?.id} attempted seller operation with role: ${userRole}`,
  );
  return res
    .status(403)
    .json({
      message: "Forbidden: only sellers and admins can perform this action",
    });
};

// middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole === "admin") {
    return next();
  }

  logger.warn(
    `User ${req.user?.id} attempted admin operation with role: ${userRole}`,
  );
  return res.status(403).json({ message: "Forbidden: admin only" });
};

module.exports = { requireSellerOrAdmin, requireAdmin };
