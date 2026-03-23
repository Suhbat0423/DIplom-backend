const User = require("../models/user.model");

async function getUserById(id) {
  return User.findById(id);
}

async function listUsers(filter = {}, opts = {}) {
  return User.find(filter)
    .limit(opts.limit || 100)
    .exec();
}

async function updateUser(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true });
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
