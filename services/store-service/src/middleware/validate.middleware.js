const Joi = require("joi");
const logger = require("../utils/logger");

const schemas = {
  createStore: Joi.object({
    name: Joi.string().required().min(3).max(255),
    description: Joi.string().allow("").optional().max(1000),
    phone: Joi.string().allow("").optional().max(50),
    address: Joi.string().allow("").optional().max(500),
    logo: Joi.string().allow("").optional(),
    coverImage: Joi.string().allow("").optional(),
    sellerId: Joi.string().optional(),
  }),

  updateStore: Joi.object({
    name: Joi.string().optional().min(3).max(255),
    description: Joi.string().allow("").optional().max(1000),
    phone: Joi.string().allow("").optional().max(50),
    email: Joi.string().email().optional(),
    address: Joi.string().allow("").optional().max(500),
    logo: Joi.string().allow("").optional(),
    coverImage: Joi.string().allow("").optional(),
    isActive: Joi.boolean().optional(),
  }),

  storeRegister: Joi.object({
    name: Joi.string().required().min(3).max(255),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    description: Joi.string().allow("").optional().max(1000),
    phone: Joi.string().allow("").optional().max(50),
    address: Joi.string().allow("").optional().max(500),
    logo: Joi.string().allow("").optional(),
    coverImage: Joi.string().allow("").optional(),
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
