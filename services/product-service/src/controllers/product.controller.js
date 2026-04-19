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
    const filter = {};
    if (req.query.storeId) filter.storeId = req.query.storeId;
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    const items = await service.listProducts(filter);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getByStoreId(req, res, next) {
  try {
    const items = await service.listProducts({ storeId: req.params.storeId });
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

module.exports = { create, getAll, getByStoreId, getById, update, remove };
