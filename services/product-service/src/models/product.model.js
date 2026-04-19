const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    categoryId: { type: String, index: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    storeId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
