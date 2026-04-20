const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const auth = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.use(auth);

router.post("/", validate(schemas.createOrder), controller.create);
router.get("/", controller.getAll);
router.get("/my", controller.getMine);
router.get("/store/:storeId", controller.getByStore);
router.get("/:id", controller.getById);
router.put("/:id/status", validate(schemas.updateStatus), controller.updateStatus);

module.exports = router;
