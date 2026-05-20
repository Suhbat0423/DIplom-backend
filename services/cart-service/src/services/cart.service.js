const Cart = require("../models/cart.model");

function getUserId(user) {
  return user && (user.id || user._id || user.sub);
}

function ensureUserId(user) {
  const userId = getUserId(user);
  if (userId) return userId;

  const err = new Error("User id not found in token");
  err.statusCode = 401;
  throw err;
}

function buildItemKey(productId, size) {
  return `${productId}::${size || ""}`;
}

function buildNewItem(itemData) {
  return {
    itemKey: buildItemKey(itemData.productId, itemData.size),
    productId: itemData.productId,
    storeId: itemData.storeId,
    name: itemData.name,
    imageUrl: itemData.imageUrl,
    price: itemData.price || 0,
    quantity: itemData.quantity || 1,
    size: itemData.size,
  };
}

async function ensureCart(userId) {
  return Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).exec();
}

async function getCart(user) {
  const userId = ensureUserId(user);
  return ensureCart(userId);
}

async function addItem(user, itemData) {
  const userId = ensureUserId(user);
  const nextItem = buildNewItem(itemData);
  const quantityToAdd = nextItem.quantity || 1;
  const itemKey = nextItem.itemKey;

  await ensureCart(userId);

  const updatedExisting = await Cart.findOneAndUpdate(
    { userId, "items.itemKey": itemKey },
    {
      $inc: { "items.$.quantity": quantityToAdd },
      $set: {
        "items.$.storeId": nextItem.storeId,
        "items.$.name": nextItem.name,
        "items.$.imageUrl": nextItem.imageUrl,
        "items.$.price": nextItem.price,
        "items.$.size": nextItem.size,
        "items.$.itemKey": nextItem.itemKey,
      },
    },
    { new: true },
  ).exec();

  if (updatedExisting) {
    return updatedExisting;
  }

  await Cart.updateOne(
    { userId },
    { $push: { items: nextItem } },
  ).exec();

  return Cart.findOne({ userId }).exec();
}

async function updateItem(user, itemId, itemData) {
  const userId = ensureUserId(user);

  if (itemData.quantity !== undefined && itemData.size === undefined) {
    const updated = await Cart.findOneAndUpdate(
      { userId, "items._id": itemId },
      { $set: { "items.$.quantity": itemData.quantity } },
      { new: true },
    ).exec();

    if (!updated) {
      const err = new Error("Cart item not found");
      err.statusCode = 404;
      throw err;
    }

    return updated;
  }

  const cart = await ensureCart(userId);
  const item = cart.items.id(itemId);
  if (!item) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }

  if (itemData.quantity !== undefined) item.quantity = itemData.quantity;
  if (itemData.size !== undefined) {
    const nextItemKey = buildItemKey(item.productId, itemData.size);
    const duplicateItem = cart.items.find(
      (cartItem) =>
        cartItem.id !== item.id &&
        (cartItem.itemKey || buildItemKey(cartItem.productId, cartItem.size)) ===
          nextItemKey,
    );

    if (duplicateItem) {
      duplicateItem.quantity += item.quantity;
      item.deleteOne();
    } else {
      item.size = itemData.size;
      item.itemKey = nextItemKey;
    }
  }

  return cart.save();
}

async function removeItem(user, itemId) {
  const userId = ensureUserId(user);
  const updated = await Cart.findOneAndUpdate(
    { userId, "items._id": itemId },
    { $pull: { items: { _id: itemId } } },
    { new: true },
  ).exec();

  if (!updated) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }

  return updated;
}

async function clearCart(user) {
  const userId = ensureUserId(user);
  return Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).exec();
}

async function backfillLegacyItemKeys() {
  await Cart.updateMany(
    { "items.itemKey": { $exists: false } },
    [
      {
        $set: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    itemKey: {
                      $concat: [
                        "$$item.productId",
                        "::",
                        { $ifNull: ["$$item.size", ""] },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ],
  ).exec();
}

backfillLegacyItemKeys().catch(() => {});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
