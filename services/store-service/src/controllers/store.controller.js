const storeService = require("../routes/services/store.service");

async function create(req, res, next) {
  try {
    const { name, description, logo, sellerId } = req.body;
    // sellerId is optional; if not provided, store is independent
    const store = await storeService.createStore(
      { name, description, logo },
      sellerId,
    );
    res.status(201).json(store);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const store = await storeService.getStoreById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (err) {
    next(err);
  }
}

async function getMySellers(req, res, next) {
  try {
    const sellerId = req.user.id;
    const stores = await storeService.getStoresBySellerId(sellerId);
    res.json(stores);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const stores = await storeService.listAllStores(
      {},
      { limit: parseInt(limit), skip: parseInt(skip) },
    );
    res.json(stores);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const storeId = req.user.id;
    const store = await storeService.updateStore(
      req.params.id,
      req.body,
      storeId,
    );
    res.json(store);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const storeId = req.user.id;
    await storeService.deleteStore(req.params.id, storeId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getById, getMySellers, getAll, update, remove };
