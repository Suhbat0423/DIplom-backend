const express = require("express");
const Joi = require("joi");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");

const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("buyer", "seller", "admin").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);

module.exports = router;
