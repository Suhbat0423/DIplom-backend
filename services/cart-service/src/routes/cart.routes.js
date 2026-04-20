const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");
const auth = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.use(auth);

router.get("/", controller.get);
router.post("/items", validate(schemas.addItem), controller.addItem);
router.put("/items/:itemId", validate(schemas.updateItem), controller.updateItem);
router.delete("/items/:itemId", controller.removeItem);
router.delete("/", controller.clear);

module.exports = router;
