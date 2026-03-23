const express = require("express");
const router = express.Router();
const authController = require("../controllers/store.auth.controller");
const { validate, schemas } = require("../middleware/validate.middleware");

// public auth endpoints
router.post(
  "/register",
  validate(schemas.storeRegister),
  authController.register,
);
router.post("/login", validate(schemas.storeLogin), authController.login);

module.exports = router;
