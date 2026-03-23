const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer"],
      default: "buyer",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
