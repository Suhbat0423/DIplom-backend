const express = require("express");
const router = express.Router();

const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;
