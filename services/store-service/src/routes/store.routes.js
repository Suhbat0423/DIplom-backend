const express = require("express");
const router = express.Router();
const controller = require("../controllers/store.controller");
const authController = require("../controllers/store.auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validate, schemas } = require("../middleware/validate.middleware");

router.post(
  "/auth/register",
  validate(schemas.storeRegister),
  authController.register,
);
router.post("/auth/login", validate(schemas.storeLogin), authController.login);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.put(
  "/:id",
  authMiddleware,
  validate(schemas.updateStore),
  controller.update,
);
router.delete("/:id", authMiddleware, controller.remove);

module.exports = router;
