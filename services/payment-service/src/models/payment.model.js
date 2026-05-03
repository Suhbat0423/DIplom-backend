const mongoose = require("mongoose");

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "cancelled"];
const PAYMENT_METHODS = ["card", "qpay", "bank_transfer", "cash", "wallet"];

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "MNT" },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "card",
      index: true,
    },
    provider: { type: String, default: "manual" },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
      index: true,
    },
    transactionId: { type: String, index: true },
    providerReference: { type: String, index: true },
    notes: { type: String, default: "" },
    failureReason: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    paidAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true },
);

PaymentSchema.index({ orderId: 1, userId: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
