const Product = require("../models/product.model");

async function createProduct(data) {
  const p = new Product(data);
  return p.save();
}

async function listProducts(filter = {}, opts = {}) {
  return Product.find(filter)
    .limit(opts.limit || 100)
    .exec();
}

async function getProductById(id) {
  return Product.findById(id).exec();
}

async function updateProduct(id, data) {
  return Product.findByIdAndUpdate(id, data, { new: true }).exec();
}

async function deleteProduct(id) {
  return Product.findByIdAndDelete(id).exec();
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
