const express = require("express");
const router = express.Router();

const storeAuthRoutes = require("./store-auth.routes");
const storeRoutes = require("./store.routes");

router.use("/stores/auth", storeAuthRoutes);
router.use("/stores", storeRoutes);

module.exports = router;
