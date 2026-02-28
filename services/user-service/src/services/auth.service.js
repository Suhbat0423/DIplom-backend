const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

async function register(userData) {
  const { username, email, password } = userData;
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: hashedPassword,
  });
  return user.save();
}

async function login(credentials) {
  const { email, password } = credentials;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new Error("Invalid password");

  const SECRET = process.env.JWT_SECRET || "secret";
  const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    SECRET,
    {
      expiresIn: EXPIRES_IN,
    },
  );
  return { token, user };
}

module.exports = {
  register,
  login,
};
