const mongoose = require("mongoose");

const PRODUCT_SIZES = ["XS", "S", "SM", "M", "MD", "L", "LG", "XL", "XXL"];

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    storeId: { type: String },
    name: { type: String },
    imageUrl: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, enum: PRODUCT_SIZES },
  },
  { _id: true },
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CartSchema.virtual("totalItems").get(function totalItems() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

CartSchema.virtual("totalPrice").get(function totalPrice() {
  return this.items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );
});

module.exports = mongoose.model("Cart", CartSchema);
module.exports.PRODUCT_SIZES = PRODUCT_SIZES;
