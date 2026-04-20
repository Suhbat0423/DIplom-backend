const Cart = require("../models/cart.model");

function getUserId(user) {
  return user && (user.id || user._id || user.sub);
}

async function getCart(user) {
  const userId = getUserId(user);
  if (!userId) {
    const err = new Error("User id not found in token");
    err.statusCode = 401;
    throw err;
  }

  let cart = await Cart.findOne({ userId }).exec();
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

async function addItem(user, itemData) {
  const cart = await getCart(user);
  const existingItem = cart.items.find(
    (item) =>
      item.productId === itemData.productId &&
      (item.size || null) === (itemData.size || null),
  );

  if (existingItem) {
    existingItem.quantity += itemData.quantity || 1;
    if (itemData.name !== undefined) existingItem.name = itemData.name;
    if (itemData.imageUrl !== undefined) existingItem.imageUrl = itemData.imageUrl;
    if (itemData.price !== undefined) existingItem.price = itemData.price;
    if (itemData.storeId !== undefined) existingItem.storeId = itemData.storeId;
    if (itemData.size !== undefined) existingItem.size = itemData.size;
  } else {
    cart.items.push({
      productId: itemData.productId,
      storeId: itemData.storeId,
      name: itemData.name,
      imageUrl: itemData.imageUrl,
      price: itemData.price || 0,
      quantity: itemData.quantity || 1,
      size: itemData.size,
    });
  }

  return cart.save();
}

async function updateItem(user, itemId, itemData) {
  const cart = await getCart(user);
  const item = cart.items.id(itemId);

  if (!item) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }

  if (itemData.quantity !== undefined) item.quantity = itemData.quantity;
  if (itemData.size !== undefined) {
    const duplicateItem = cart.items.find(
      (cartItem) =>
        cartItem.id !== item.id &&
        cartItem.productId === item.productId &&
        (cartItem.size || null) === itemData.size,
    );

    if (duplicateItem) {
      duplicateItem.quantity += item.quantity;
      item.deleteOne();
    } else {
      item.size = itemData.size;
    }
  }

  return cart.save();
}

async function removeItem(user, itemId) {
  const cart = await getCart(user);
  const item = cart.items.id(itemId);

  if (!item) {
    const err = new Error("Cart item not found");
    err.statusCode = 404;
    throw err;
  }

  item.deleteOne();
  return cart.save();
}

async function clearCart(user) {
  const cart = await getCart(user);
  cart.items = [];
  return cart.save();
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
