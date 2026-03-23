const Joi = require("joi");
const logger = require("../utils/logger");

const schemas = {
  createStore: Joi.object({
    name: Joi.string().required().min(3).max(255),
    description: Joi.string().optional().max(1000),
    logo: Joi.string().optional().uri(),
    sellerId: Joi.string().optional(),
  }),

  updateStore: Joi.object({
    name: Joi.string().optional().min(3).max(255),
    description: Joi.string().optional().max(1000),
    logo: Joi.string().optional().uri(),
    isActive: Joi.boolean().optional(),
  }),

  storeRegister: Joi.object({
    name: Joi.string().required().min(3).max(255),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    description: Joi.string().optional().max(1000),
    logo: Joi.string().optional().uri(),
    sellerId: Joi.string().optional(),
  }),

  storeLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      logger.warn("Validation error", { messages });
      return res
        .status(400)
        .json({ message: "Validation error", errors: messages });
    }
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
