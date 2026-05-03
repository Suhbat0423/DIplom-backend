const express = require("express");
const router = express.Router();

const paymentRoutes = require("./payment.routes");

router.use("/payments", paymentRoutes);

module.exports = router;
