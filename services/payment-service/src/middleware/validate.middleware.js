const Joi = require("joi");

const paymentStatuses = ["pending", "paid", "failed", "refunded", "cancelled"];
const paymentMethods = ["card", "qpay", "bank_transfer", "cash", "wallet"];

const schemas = {
  createPayment: Joi.object({
    orderId: Joi.string().required(),
    method: Joi.string()
      .valid(...paymentMethods)
      .default("card"),
    currency: Joi.string().length(3).uppercase().default("MNT"),
    provider: Joi.string().allow("").max(100).default("manual"),
    notes: Joi.string().allow("").max(1000).optional(),
    metadata: Joi.object().unknown(true).default({}),
  }),
  confirmPayment: Joi.object({
    transactionId: Joi.string().allow("").max(255).optional(),
    providerReference: Joi.string().allow("").max(255).optional(),
    metadata: Joi.object().unknown(true).optional(),
  }),
  failPayment: Joi.object({
    reason: Joi.string().allow("").max(1000).optional(),
    transactionId: Joi.string().allow("").max(255).optional(),
    metadata: Joi.object().unknown(true).optional(),
  }),
  refundPayment: Joi.object({
    reason: Joi.string().allow("").max(1000).optional(),
    metadata: Joi.object().unknown(true).optional(),
  }),
};

function validate(schema) {
  return (req, res, next) => {
    if (!schema) return next();
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((d) => d.message).join(", ") });
    }
    req.body = value;
    next();
  };
}

module.exports = { validate, schemas, paymentStatuses, paymentMethods };
