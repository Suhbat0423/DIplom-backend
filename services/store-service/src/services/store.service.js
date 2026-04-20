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

  // Password changes should go through a dedicated password flow.
  if (data.password) delete data.password;

  return Store.findByIdAndUpdate(id, data, { new: true });
}

async function requestVerification(id, storeId) {
  const store = await Store.findById(id);
  if (!store) throw new Error("Store not found");
  if (storeId && store._id.toString() !== storeId) {
    throw new Error("Unauthorized: cannot update another store");
  }

  store.verificationStatus = "pending";
  store.verificationFeedback = "";
  store.verified = false;

  return store.save();
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
  requestVerification,
  deleteStore,
};
