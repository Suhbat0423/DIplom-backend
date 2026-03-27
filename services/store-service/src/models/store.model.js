const mongoose = require("mongoose");
const { Schema } = mongoose;

const StoreSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    sellerId: { type: String, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Store", StoreSchema);
