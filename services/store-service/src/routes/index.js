const express = require("express");
const router = express.Router();

const storeRoutes = require("./store.routes");

router.use("/stores", storeRoutes);

module.exports = router;
