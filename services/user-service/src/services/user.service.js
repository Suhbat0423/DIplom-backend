const User = require("../models/user.model");

async function getUserById(id) {
  return User.findById(id).populate("store");
}

async function listUsers(filter = {}, opts = {}) {
  return User.find(filter)
    .limit(opts.limit || 100)
    .populate("store")
    .exec();
}

async function updateUser(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true }).populate("store");
}

async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

module.exports = {
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
};
