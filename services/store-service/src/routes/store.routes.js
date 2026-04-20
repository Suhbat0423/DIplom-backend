const express = require("express");
const router = express.Router();
const controller = require("../controllers/store.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.put(
  "/:id",
  authMiddleware,
  validate(schemas.updateStore),
  controller.update,
);
router.post(
  "/:id/verification",
  authMiddleware,
  controller.requestVerification,
);
router.delete("/:id", authMiddleware, controller.remove);

module.exports = router;
