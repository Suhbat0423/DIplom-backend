const mongoose = require("mongoose");
const { Schema } = mongoose;

const StoreSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    phone: { type: String },
    address: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    sellerId: { type: String, index: true },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["incomplete", "pending", "verified", "rejected"],
      default: "incomplete",
    },
    verificationFeedback: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Store", StoreSchema);
