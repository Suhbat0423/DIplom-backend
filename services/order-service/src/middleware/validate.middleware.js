const Joi = require("joi");

const productSizes = ["XS", "S", "SM", "M", "MD", "L", "LG", "XL", "XXL"];
const orderStatuses = [
  "pending",
  "confirmed",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const paymentStatuses = ["unpaid", "paid", "failed", "refunded"];

const productSizeSchema = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const normalized = value.toUpperCase();
    if (!productSizes.includes(normalized)) {
      return helpers.error("any.only");
    }
    return normalized;
  })
  .messages({
    "any.only": `size must be one of ${productSizes.join(", ")}`,
  });

const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  storeId: Joi.string().allow("").optional(),
  name: Joi.string().min(1).max(255).optional(),
  imageUrl: Joi.string().allow("").optional(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  size: productSizeSchema.optional(),
});

const shippingAddressSchema = Joi.object({
  fullName: Joi.string().min(1).max(255).optional(),
  phone: Joi.string().min(1).max(50).optional(),
  city: Joi.string().min(1).max(100).optional(),
  district: Joi.string().min(1).max(100).optional(),
  addressLine1: Joi.string().min(1).max(500).optional(),
  addressLine2: Joi.string().allow("").max(500).optional(),
  postalCode: Joi.string().allow("").max(30).optional(),
}).optional();

const schemas = {
  createOrder: Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).optional(),
    shippingAddress: shippingAddressSchema,
    deliveryFee: Joi.number().min(0).default(0),
    tax: Joi.number().min(0).default(0),
    notes: Joi.string().allow("").max(1000).optional(),
  }),
  updateStatus: Joi.object({
    status: Joi.string()
      .valid(...orderStatuses)
      .required(),
    paymentStatus: Joi.string()
      .valid(...paymentStatuses)
      .optional(),
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

module.exports = { validate, schemas, orderStatuses, paymentStatuses };
