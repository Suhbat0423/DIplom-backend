const Product = require("../models/product.model");

async function createProduct(data, storeId) {
  const p = new Product({ ...data, storeId });
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

async function updateProduct(id, data, storeId) {
  const prod = await Product.findById(id);
  if (!prod) throw new Error("Product not found");
  if (prod.storeId !== storeId)
    throw new Error("Unauthorized: not your product");
  return Product.findByIdAndUpdate(id, data, { new: true }).exec();
}

async function deleteProduct(id, storeId) {
  const prod = await Product.findById(id);
  if (!prod) throw new Error("Product not found");
  if (prod.storeId !== storeId)
    throw new Error("Unauthorized: not your product");
  return Product.findByIdAndDelete(id).exec();
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
