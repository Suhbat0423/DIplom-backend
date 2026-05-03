const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");
const auth = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.use(auth);

router.post("/", validate(schemas.createPayment), controller.create);
router.get("/", controller.getAll);
router.get("/order/:orderId", controller.getByOrderId);
router.get("/:id", controller.getById);
router.post("/:id/confirm", validate(schemas.confirmPayment), controller.confirm);
router.post("/:id/fail", validate(schemas.failPayment), controller.fail);
router.post("/:id/refund", validate(schemas.refundPayment), controller.refund);

module.exports = router;
