const Joi = require("joi");

const productSizes = ["XS", "S", "SM", "M", "MD", "L", "LG", "XL", "XXL"];
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

const schemas = {
  addItem: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
    name: Joi.string().min(1).max(255).optional(),
    imageUrl: Joi.string().allow("").optional(),
    price: Joi.number().min(0).optional(),
    storeId: Joi.string().optional(),
    size: productSizeSchema.optional(),
  }),
  updateItem: Joi.object({
    quantity: Joi.number().integer().min(1).optional(),
    size: productSizeSchema.optional(),
  }).or("quantity", "size"),
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

module.exports = { validate, schemas };
