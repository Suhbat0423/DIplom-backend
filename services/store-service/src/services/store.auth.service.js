const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Store = require("../models/store.model");

function createError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function register(storeData) {
  const { name, email, password, description, logo, sellerId } = storeData;

  // Check if store email already exists
  const existing = await Store.findOne({ email });
  if (existing) throw createError("Store email already registered", 400);

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create store
  const store = new Store({
    name,
    email,
    password: hashed,
    description,
    logo,
    sellerId,
  });

  const saved = await store.save();
  const result = saved.toObject();
  delete result.password; // Don't return password
  return result;
}

async function login(credentials) {
  const { email, password } = credentials;

  if (!email || !password) {
    throw createError("Email and password are required", 400);
  }

  // Include password field (it's hidden by default with select: false)
  const store = await Store.findOne({ email }).select("+password");
  if (!store) throw createError("Store not found", 404);

  // Verify password
  const match = await bcrypt.compare(password, store.password);
  if (!match) throw createError("Invalid password", 401);

  // Generate JWT token
  const SECRET = process.env.JWT_SECRET || "secret";
  const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign(
    { id: store._id, name: store.name, email: store.email, role: "store" },
    SECRET,
    { expiresIn: EXPIRES_IN },
  );

  // Return without password
  const storeObj = store.toObject();
  delete storeObj.password;

  return { token, store: storeObj };
}

module.exports = {
  register,
  login,
};
