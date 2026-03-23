const service = require("../services/product.service");

async function create(req, res, next) {
  try {
    const storeId = req.user && req.user.id;
    const result = await service.createProduct(req.body, storeId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const items = await service.listProducts();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getProductById(req.params.id);
    if (!item) return res.status(404).json({ message: "Product not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const storeId = req.user && req.user.id;
    const updated = await service.updateProduct(
      req.params.id,
      req.body,
      storeId,
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const storeId = req.user && req.user.id;
    const deleted = await service.deleteProduct(req.params.id, storeId);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getById, update, remove };
