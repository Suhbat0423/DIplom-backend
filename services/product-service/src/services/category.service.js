const Category = require("../models/category.model");

async function createCategory(data) {
  const category = new Category(data);
  return category.save();
}

async function listCategories(filter = {}, opts = {}) {
  return Category.find(filter)
    .limit(opts.limit || 100)
    .exec();
}

async function getCategoryById(id) {
  return Category.findById(id).exec();
}

async function updateCategory(id, data) {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  return Category.findByIdAndUpdate(id, data, { new: true }).exec();
}

async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  return Category.findByIdAndDelete(id).exec();
}

module.exports = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
