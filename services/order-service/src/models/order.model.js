const mongoose = require("mongoose");

const PRODUCT_SIZES = ["XS", "S", "SM", "M", "MD", "L", "LG", "XL", "XXL"];
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"];

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    storeId: { type: String, index: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, enum: PRODUCT_SIZES },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    phone: { type: String },
    city: { type: String },
    district: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    postalCode: { type: String },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    customerUsername: { type: String },
    items: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    subtotal: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "unpaid",
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true },
);

OrderSchema.pre("validate", function setOrderNumber() {
  if (!this.orderNumber) {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.orderNumber = `ORD-${stamp}-${suffix}`;
  }
});

module.exports = mongoose.model("Order", OrderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
