const Store = require("../models/store.model");

async function createStore(storeData, sellerId) {
  const newStore = {
    ...storeData,
  };
  // only include sellerId if provided
  if (sellerId) {
    newStore.sellerId = sellerId;
  }
  const store = new Store(newStore);
  return store.save();
}

async function getStoreById(id) {
  return Store.findById(id);
}

async function getStoresBySellerId(sellerId) {
  return Store.find({ sellerId });
}

async function listAllStores(filter = {}, opts = {}) {
  return Store.find(filter)
    .limit(opts.limit || 100)
    .skip(opts.skip || 0)
    .sort({ createdAt: -1 })
    .exec();
}

async function updateStore(id, data, storeId) {
  // If storeId provided, verify ownership (for protected routes)
  if (storeId) {
    const store = await Store.findById(id);
    if (!store) throw new Error("Store not found");
    if (store._id.toString() !== storeId) {
      throw new Error("Unauthorized: cannot update another store");
    }
  }

  // Don't allow changing email or password via regular update
  if (data.email) delete data.email;
  if (data.password) delete data.password;

  return Store.findByIdAndUpdate(id, data, { new: true });
}

async function deleteStore(id, storeId) {
  // If storeId provided, verify ownership (for protected routes)
  if (storeId) {
    const store = await Store.findById(id);
    if (!store) throw new Error("Store not found");
    if (store._id.toString() !== storeId) {
      throw new Error("Unauthorized: cannot delete another store");
    }
  }

  return Store.findByIdAndDelete(id);
}

module.exports = {
  createStore,
  getStoreById,
  getStoresBySellerId,
  listAllStores,
  updateStore,
  deleteStore,
};
