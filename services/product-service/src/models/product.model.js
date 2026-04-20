const mongoose = require("mongoose");

const PRODUCT_SIZES = ["XS", "S", "SM", "M", "MD", "L", "LG", "XL", "XXL"];

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    categoryId: { type: String, index: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, default: 0 },
    sizes: {
      type: [String],
      enum: PRODUCT_SIZES,
      default: [],
    },
    sizeStock: {
      type: Map,
      of: {
        type: Number,
        min: 0,
      },
      default: {},
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
    storeId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
module.exports.PRODUCT_SIZES = PRODUCT_SIZES;
