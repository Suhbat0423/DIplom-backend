const express = require("express");
const router = express.Router();

const cartRoutes = require("./cart.routes");

router.use("/cart", cartRoutes);

module.exports = router;
