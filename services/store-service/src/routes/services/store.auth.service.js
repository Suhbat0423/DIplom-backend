const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Store = require("../../models/store.model");

async function register(storeData) {
  const { name, email, password, description, logo, sellerId } = storeData;

  // Check if store email already exists
  const existing = await Store.findOne({ email });
  if (existing) throw new Error("Store email already registered");

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
    throw new Error("Email and password are required");
  }

  // Include password field (it's hidden by default with select: false)
  const store = await Store.findOne({ email }).select("+password");
  if (!store) throw new Error("Store not found");

  // Verify password
  const match = await bcrypt.compare(password, store.password);
  if (!match) throw new Error("Invalid password");

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
