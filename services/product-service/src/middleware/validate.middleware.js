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

const sizeStockSchema = Joi.object()
  .pattern(
    Joi.string()
      .trim()
      .custom((value, helpers) => {
        const normalized = value.toUpperCase();
        if (!productSizes.includes(normalized)) {
          return helpers.error("any.only");
        }
        return normalized;
      }),
    Joi.number().integer().min(0),
  )
  .optional();

const schemas = {
  createProduct: Joi.object({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().allow("").optional(),
    imageUrl: Joi.string().allow("").optional(),
    categoryId: Joi.string().optional(),
    price: Joi.number().required().min(0),
    stock: Joi.number().integer().min(0).optional(),
    sizes: Joi.array().items(productSizeSchema).unique().optional(),
    sizeStock: sizeStockSchema,
    metadata: Joi.any().optional(),
  }),
  updateProduct: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    description: Joi.string().allow("").optional(),
    imageUrl: Joi.string().allow("").optional(),
    categoryId: Joi.string().optional(),
    price: Joi.number().optional().min(0),
    stock: Joi.number().integer().min(0).optional(),
    sizes: Joi.array().items(productSizeSchema).unique().optional(),
    sizeStock: sizeStockSchema,
    metadata: Joi.any().optional(),
  }),
  createCategory: Joi.object({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional(),
  }),
  updateCategory: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    description: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional(),
  }),
};

function validate(schema) {
  return (req, res, next) => {
    if (!schema) return next();
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error)
      return res
        .status(400)
        .json({ message: error.details.map((d) => d.message).join(", ") });
    req.body = value;
    next();
  };
}

module.exports = { validate, schemas };
